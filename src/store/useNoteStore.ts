import { create } from "zustand";
import { notes } from "@/lib/types";
import { notesService } from "@/lib/notes";
import { createAIService } from "@/lib/ai";

const saveToLocal = (notes: notes[]) => {
  try {
    localStorage.setItem('smarkdown_notes', JSON.stringify(notes));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

const loadFromLocal = (): notes[] => {
  try {
    const stored = localStorage.getItem('smarkdown_notes');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return [];
  }
};

type State = {
    currentNote?: notes | null;
    notes: notes[];
    isSaving: boolean;
    isLoading: boolean;
    isAILoading: boolean;
    error: string | null;
    aiSuggestions: Array<{title: string, content: string, position: string}>;
    relatedNotes: {id: string; score: number}[];
    summary: string | null;
    isLoggedIn: boolean;
    setCurrentNote: (note: notes | null) => void;
    setField: (field: Partial<notes>) => void;
    loadNotes: () => Promise<void>;
    createNote: () => Promise<void>;
    saveNote: () => Promise<void>;
    deleteNote: (id: string) => Promise<void>;
    searchNotes: (query: string) => Promise<void>;
    clearError: () => void;
    setLoggedIn: (loggedIn: boolean) => void;
    generateSummary: () => Promise<void>;
    suggestTags: () => Promise<void>;
    improveContent: () => Promise<void>;
    generateSuggestions: () => Promise<void>;
    findRelatedNotes: () => Promise<void>;
    clearAISuggestions: () => void;
    clearRelatedNotes: () => void;
    clearSummary: () => void;
    applySuggestion: (suggestion: {title: string, content: string, position: string}) => void;
};

export const useNoteStore = create<State>((set, get) => ({
    currentNote: undefined,
    notes: [],
    isSaving: false,
    isLoading: false,
    isAILoading: false,
    error: null,
    aiSuggestions: [],
    relatedNotes: [],
    summary: null,
    isLoggedIn: false,
    
    setCurrentNote: (note: notes | null) => set({ currentNote: note }),
    
    setLoggedIn: (loggedIn: boolean) => set({ isLoggedIn: loggedIn }),
    
    setField: (field: Partial<notes>) => {
        const { currentNote } = get();
        if (currentNote) {
            const updatedNote = { ...currentNote, ...field };
            set({ currentNote: updatedNote });
            
            const { notes } = get();
            const updatedNotes = notes.map(note => 
                note.id === updatedNote.id ? updatedNote : note
            );
            set({ notes: updatedNotes });
            
            if (typeof window !== 'undefined') {
              saveToLocal(updatedNotes);
            }
        }
    },
    
    loadNotes: async () => {
        const { isLoggedIn } = get();
        
        if (isLoggedIn) {
            set({ isLoading: true, error: null });
            try {
                const notes = await notesService.getNotes();
                set({ notes, isLoading: false });
            } catch (error) {
                set({ error: (error as Error).message, isLoading: false });
            }
        } else {
            if (typeof window !== 'undefined') {
                const notes = loadFromLocal();
                set({ notes });
            }
        }
    },
    
    createNote: async () => {
        const { isLoggedIn } = get();
        
        if (isLoggedIn) {
            set({ isSaving: true, error: null });
            try {
                const newNote = await notesService.createNote({
                    title: 'Untitled',
                    content: '',
                    tags: []
                });
                const { notes } = get();
                set({ 
                    currentNote: newNote, 
                    notes: [newNote, ...notes],
                    isSaving: false 
                });
            } catch (error) {
                set({ error: (error as Error).message, isSaving: false });
            }
        } else {
            const newNote: notes = {
                id: `local_${Date.now()}`,
                user_id: 'local',
                title: 'Untitled',
                content: '',
                tags: [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            const { notes } = get();
            const updatedNotes = [newNote, ...notes];
            set({ 
                currentNote: newNote, 
                notes: updatedNotes
            });
            if (typeof window !== 'undefined') {
              saveToLocal(updatedNotes);
            }
        }
    },
    
    saveNote: async () => {
        const { currentNote, isLoggedIn } = get();
        if (!currentNote?.id) return;
        
        if (isLoggedIn && !currentNote.id.startsWith('local_')) {
            set({ isSaving: true, error: null });
            try {
                const updatedNote = await notesService.updateNote(currentNote.id, {
                    title: currentNote.title,
                    content: currentNote.content,
                    tags: currentNote.tags
                });
                
                const { notes } = get();
                const updatedNotes = notes.map(note => 
                    note.id === updatedNote.id ? updatedNote : note
                );
                set({ 
                    currentNote: updatedNote,
                    notes: updatedNotes,
                    isSaving: false 
                });
            } catch (error) {
                set({ error: (error as Error).message, isSaving: false });
            }
        } else {
            set({ isSaving: false });
        }
    },
    
    deleteNote: async (id: string) => {
        const { isLoggedIn } = get();
        
        if (isLoggedIn && !id.startsWith('local_')) {
            set({ isLoading: true, error: null });
            try {
                await notesService.deleteNote(id);
                const { currentNote, notes } = get();
                
                set({ 
                    notes: notes.filter(note => note.id !== id),
                    currentNote: currentNote?.id === id ? null : currentNote,
                    isLoading: false 
                });
            } catch (error) {
                set({ error: (error as Error).message, isLoading: false });
            }
        } else {
            const { currentNote, notes } = get();
            const filteredNotes = notes.filter(note => note.id !== id);
            set({ 
                notes: filteredNotes,
                currentNote: currentNote?.id === id ? null : currentNote
            });
            if (typeof window !== 'undefined') {
              saveToLocal(filteredNotes);
            }
        }
    },
    
    searchNotes: async (query: string) => {
        const { isLoggedIn } = get();
        
        if (isLoggedIn) {
            if (!query.trim()) {
                get().loadNotes();
                return;
            }
            
            set({ isLoading: true, error: null });
            try {
                const notes = await notesService.searchNotes(query);
                set({ notes, isLoading: false });
            } catch (error) {
                set({ error: (error as Error).message, isLoading: false });
            }
        } else {
            // Search locally
            if (!query.trim()) {
                if (typeof window !== 'undefined') {
                    const notes = loadFromLocal();
                    set({ notes });
                }
                return;
            }
            
            if (typeof window !== 'undefined') {
                const notes = loadFromLocal();
                const filtered = notes.filter(note => 
                    note.title?.toLowerCase().includes(query.toLowerCase()) ||
                    note.content?.toLowerCase().includes(query.toLowerCase()) ||
                    note.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
                );
                set({ notes: filtered });
            }
        }
    },
    
    clearError: () => set({ error: null }),

    generateSummary: async () => {
        const { currentNote } = get();
        if (!currentNote?.content?.trim()) return;

        set({ isAILoading: true, error: null });
        try {
            const aiService = createAIService();
            const summary = await aiService.generateSummary(currentNote.content);
            
            set({ 
                currentNote: { ...currentNote, summary },
                isAILoading: false 
            });
            
            get().saveNote();
        } catch (error) {
            set({ error: (error as Error).message, isAILoading: false });
        }
    },

    suggestTags: async () => {
        const { currentNote } = get();
        if (!currentNote?.content?.trim() && !currentNote?.title?.trim()) return;

        set({ isAILoading: true, error: null });
        try {
            const aiService = createAIService();
            const suggestedTags = await aiService.suggestTags(
                currentNote.content || '',
                currentNote.title || ''
            );
            
            const existingTags = currentNote.tags || [];
            const newTags = [...new Set([...existingTags, ...suggestedTags])];
            
            set({ 
                currentNote: { ...currentNote, tags: newTags },
                isAILoading: false 
            });
            
            get().saveNote();
        } catch (error) {
            set({ error: (error as Error).message, isAILoading: false });
        }
    },

    improveContent: async () => {
        const { currentNote } = get();
        if (!currentNote?.content?.trim()) return;

        set({ isAILoading: true, error: null });
        try {
            const aiService = createAIService();
            const improvedContent = await aiService.improveContent(currentNote.content);
            
            set({ 
                currentNote: { ...currentNote, content: improvedContent },
                isAILoading: false 
            });
            
            get().saveNote();
        } catch (error) {
            set({ error: (error as Error).message, isAILoading: false });
        }
    },

    generateSuggestions: async () => {
        const { currentNote } = get();
        if (!currentNote?.content?.trim()) return;

        set({ isAILoading: true, error: null });
        try {
            const aiService = createAIService();
            const suggestions = await aiService.generateSuggestions(currentNote.content);
            
            set({ 
                aiSuggestions: suggestions,
                isAILoading: false 
            });
        } catch (error) {
            set({ error: (error as Error).message, isAILoading: false });
        }
    },

    findRelatedNotes: async () => {
        const { currentNote, notes } = get();
        if (!currentNote?.content?.trim() || notes.length <= 1) return;

        set({ isAILoading: true, error: null });
        try {
            const aiService = createAIService();
            const otherNotes = notes.filter(note => note.id !== currentNote.id);
            const related = await aiService.findRelatedNotes(currentNote, otherNotes);
            
            set({ 
                relatedNotes: related,
                isAILoading: false 
            });
        } catch (error) {
            set({ error: (error as Error).message, isAILoading: false });
        }
    },

    clearAISuggestions: () => set({ aiSuggestions: [] }),
    clearRelatedNotes: () => set({ relatedNotes: [] }),
    clearSummary: () => set({ summary: null }),
    
    applySuggestion: (suggestion: {title: string, content: string, position: string}) => {
        const { currentNote } = get();
        if (!currentNote) return;

        let newContent = currentNote.content || '';
        
        switch (suggestion.position) {
            case 'beginning':
                newContent = suggestion.content + '\n\n' + newContent;
                break;
            case 'middle':
                const lines = newContent.split('\n');
                const middleIndex = Math.floor(lines.length / 2);
                lines.splice(middleIndex, 0, suggestion.content);
                newContent = lines.join('\n');
                break;
            case 'end':
            default:
                newContent = newContent + '\n\n' + suggestion.content;
                break;
        }

        set({ 
            currentNote: { ...currentNote, content: newContent },
            aiSuggestions: get().aiSuggestions.filter(s => s !== suggestion)
        });
        
        get().saveNote();
    }
}));