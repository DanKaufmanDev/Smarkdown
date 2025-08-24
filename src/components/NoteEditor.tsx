"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useNoteStore } from "@/store/useNoteStore";
import MarkdownPreview from "./MarkdownPreview";
import AITools from "./AITools";

type ViewMode = "edit" | "preview" | "split";

export default function NoteEditor() {
  const { currentNote, setField, saveNote, deleteNote, isSaving } =
    useNoteStore();
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("edit");
  const [tagsInput, setTagsInput] = useState("");
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debouncedSave = useCallback(() => {
    if (!currentNote?.id) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      saveNote();
    }, 5000);
  }, [currentNote?.id, saveNote]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setField({ content: e.target.value });
    debouncedSave();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setField({ title: e.target.value });
    debouncedSave();
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagsInput(e.target.value);
  };

  const handleTagsSave = () => {
    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    setField({ tags });
    debouncedSave();
  };

  useEffect(() => {
    setTagsInput(currentNote?.tags?.join(", ") || "");
  }, [currentNote?.tags]);

  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (currentNote && !currentNote.title && titleRef.current) {
      titleRef.current.focus();
    }
  }, [currentNote]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "e":
            e.preventDefault();
            setViewMode("edit");
            break;
          case "p":
            e.preventDefault();
            setViewMode("preview");
            break;
          case "s":
            e.preventDefault();
            if (e.shiftKey) {
              setViewMode("split");
            } else {
              saveNote();
            }
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [saveNote]);

  const handleDeleteNote = () => {
    if (!currentNote?.id) return;

    if (
      confirm(
        "Are you sure you want to delete this note? This action cannot be undone."
      )
    ) {
      deleteNote(currentNote.id);
    }
  };

  if (!currentNote) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-50px)] bg-slate-900">
        <div className="text-center">
          <h3 className="text-lg font-medium text-white mb-2">
            Welcome to Smarkdown
          </h3>
          <p className="text-slate-400">
            Select a note from the sidebar or create a new one to get started.
          </p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (viewMode) {
      case 'preview':
        return (
          <div className="overflow-auto max-h-[calc(100vh-406px)] min-h-0">
            <div className=" overflow-y-auto">
              <MarkdownPreview content={currentNote.content || ''} />
            </div>
          </div>
        );
      case 'split':
        return (
          <div className="flex h-[calc(100vh-406px)] min-h-0">
            <div className="w-1/2 border-r border-slate-700">
              <div className="h-full overflow-y-auto p-4">
                <textarea
                  ref={contentRef}
                  value={currentNote.content || ''}
                  onChange={handleContentChange}
                  placeholder="Start writing your markdown note..."
                  className="w-full h-full resize-none border-none outline-none text-slate-100 bg-slate-900 font-mono text-sm leading-relaxed placeholder-slate-500"
                  style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}
                />
              </div>
            </div>
            <div className="w-1/2">
              <div className="h-full overflow-y-auto p-4">
                <MarkdownPreview content={currentNote.content || ''} />
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="overflow-auto h-[calc(100vh-406px)] min-h-0">
            <div className="overflow-y-auto p-4 h-full w-full">
              <textarea
                ref={contentRef}
                value={currentNote.content || ''}
                onChange={handleContentChange}
                placeholder="Start writing your markdown note..."
                className="w-full h-full resize-none border-none outline-none text-slate-100 bg-slate-900 font-mono text-sm leading-relaxed placeholder-slate-500"
                style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 overflow-hidden">
      {/* Fixed Headers */}
      <div className="flex-shrink-0">
        <div className="border-b border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <input
              ref={titleRef}
              type="text"
              value={currentNote.title || ""}
              onChange={handleTitleChange}
              placeholder="Note title..."
              className="text-xl font-semibold text-white bg-transparent border-none outline-none w-full placeholder-slate-500"
            />
            <div className="flex items-center space-x-2">
              {isSaving && (
                <span className="text-sm text-slate-400">Saving...</span>
              )}
              <span className="text-sm text-slate-500">
                {currentNote.updated_at &&
                  new Date(currentNote.updated_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        <div className="border-b border-slate-700 p-4">
          <input
            type="text"
            value={tagsInput}
            onChange={handleTagsChange}
            onBlur={handleTagsSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleTagsSave();
              }
            }}
            placeholder="Add tags (comma separated)..."
            className="w-full text-sm text-slate-300 bg-transparent border-none outline-none placeholder-slate-500"
          />
        </div>
        <div className="border-b border-slate-700 px-4 py-2 bg-slate-800">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setViewMode("edit")}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === "edit"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === "preview"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === "split"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Split
            </button>
          </div>
        </div>
      </div>

      {/* Flexible middle section */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Content Area */}
        <div className="flex-1 overflow-hidden min-h-0">
          {renderContent()}
        </div>

        {/* AI Tools */}
        <div className="flex-shrink-0 border-t border-slate-700 bg-slate-800 overflow-y-auto" style={{ minHeight: '80px', maxHeight: '40vh' }}>
          <AITools />
        </div>
      </div>

      {/* Footer - Back in NoteEditor */}
      <div className="flex-shrink-0 border-t border-slate-700 p-4 bg-slate-800">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <div>
            <span className="mr-4">
              Characters: {currentNote.content?.length || 0}
            </span>
            <span>
              Words: {currentNote.content?.split(/\s+/).filter(word => word.length > 0).length || 0}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span>
              {viewMode === 'preview' ? 'Preview Mode' : 
               viewMode === 'split' ? 'Split View' : 'Markdown'}
            </span>
            <button
              onClick={saveNote}
              disabled={isSaving}
              className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleDeleteNote}
              disabled={!currentNote?.id}
              className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50 transition-colors"
              title="Delete this note"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
