'use client';

import { useNoteStore } from '@/store/useNoteStore';

export default function AITools() {
  const { 
    currentNote, 
    notes,
    isAILoading, 
    aiSuggestions, 
    relatedNotes,
    summary,
    generateSummary, 
    suggestTags, 
    improveContent, 
    generateSuggestions,
    findRelatedNotes,
    clearAISuggestions,
    clearRelatedNotes,
    clearSummary,
    applySuggestion,
    declineSuggestion
  } = useNoteStore();

  if (!currentNote) {
    return null;
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white">AI Tools</h3>
          {isAILoading && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
              <span className="text-xs text-slate-400">AI working...</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              generateSummary();
            }}
            disabled={isAILoading || !currentNote.content?.trim()}
            className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            title="Generate a summary of your note"
          >
          Summarize
          </button>

          <button
            onClick={() => {
              suggestTags();
            }}
            disabled={isAILoading || (!currentNote.content?.trim() && !currentNote.title?.trim())}
            className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            title="Suggest relevant tags"
          >
          Suggest Tags
          </button>

          <button
            onClick={() => {
              improveContent();
            }}
            disabled={isAILoading || !currentNote.content?.trim()}
            className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            title="Improve grammar and clarity"
          >
          Improve
          </button>

          <button
            onClick={() => {
              generateSuggestions();
            }}
            disabled={isAILoading || !currentNote.content?.trim()}
            className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            title="Get related topic suggestions"
          >
          Suggestions
          </button>

          <button
            onClick={() => {
              findRelatedNotes();
            }}
            disabled={isAILoading || !currentNote.content?.trim() || notes.length <= 1}
            className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            title="Find related notes"
          >
          Related Notes
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {relatedNotes.length > 0 && (
          <div className="bg-slate-700 rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-white">Related Notes</h4>
              <button
                onClick={clearRelatedNotes}
                className="text-slate-400 hover:text-white text-xs transition-colors"
              >
                ×
              </button>
            </div>
            <div className="space-y-1">
              {relatedNotes.map((related) => {
                const note = notes.find(n => n.id === related.id);
                if (!note) return null;
                
                return (
                  <div
                    key={related.id}
                    className="text-sm text-slate-300 bg-slate-600 rounded px-2 py-1 cursor-pointer hover:bg-slate-500 transition-colors flex justify-between items-center"
                    onClick={() => {
                      useNoteStore.getState().setCurrentNote(note);
                    }}
                  >
                    <span className="truncate">{note.title || 'Untitled'}</span>
                    <span className="text-xs text-slate-400 ml-2">
                      {Math.round(related.score * 100)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {aiSuggestions.length > 0 && (
          <div className="bg-slate-700 rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-white">Content Suggestions</h4>
              <button
                onClick={clearAISuggestions}
                className="text-slate-400 hover:text-white text-xs transition-colors"
              >
                ×
              </button>
            </div>
            <div className="space-y-2">
              {aiSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="bg-slate-600 rounded p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium text-white">{suggestion.title}</h5>
                    <span className="text-xs text-slate-400 capitalize">{suggestion.position}</span>
                  </div>
                  <div className="text-sm text-slate-300 mb-3 bg-slate-700 p-2 rounded">
                    <pre className="whitespace-pre-wrap font-mono text-xs">{suggestion.content}</pre>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => applySuggestion(suggestion)}
                      className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                    >
                      ✓ Accept
                    </button>
                    <button
                      onClick={() => declineSuggestion(index)}
                      className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                    >
                      ✗ Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {summary && (
          <div className="bg-slate-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-white">Summary</h4>
              <button
                onClick={clearSummary}
                className="text-slate-400 hover:text-white text-xs transition-colors"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {summary}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 