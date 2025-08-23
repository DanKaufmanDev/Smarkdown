'use client';

import { useState } from 'react';
import { useNoteStore } from '@/store/useNoteStore';

export default function NoteSidebar() {
  const { notes, currentNote, createNote, setCurrentNote, searchNotes, isLoading } = useNoteStore();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchNotes(query);
  };

  const handleCreateNote = () => {
    createNote();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col h-screen overflow-scroll">
      <div className="p-4 border-b border-slate-700">
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        
        <button
          onClick={handleCreateNote}
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors"
        >
          + New Note
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-slate-400">
            Loading notes...
          </div>
        ) : notes.length === 0 ? (
          <div className="p-4 text-center text-slate-400">
            {searchQuery ? 'No notes found' : 'No notes yet. Create your first note!'}
          </div>
        ) : (
          <div className="p-2">
            {notes.map((note) => (
              <div
                key={note.id}
                onClick={() => setCurrentNote(note)}
                className={`p-3 rounded-md cursor-pointer transition-colors ${
                  currentNote?.id === note.id
                    ? 'bg-indigo-600/20 border border-indigo-500/30'
                    : 'hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate">
                      {note.title || 'Untitled'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDate(note.updated_at)}
                    </p>
                    {note.content && (
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                        {note.content.replace(/[#*`]/g, '').substring(0, 100)}
                      </p>
                    )}
                  </div>
                </div>
                
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {note.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block bg-slate-600 text-slate-200 text-xs px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {note.tags.length > 3 && (
                      <span className="text-xs text-slate-400">
                        +{note.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 