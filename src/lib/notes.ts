import { supabase } from './supabaseClient';
import { notes } from './types';

export const notesService = {
  // Get all notes for the current user
  async getNotes(): Promise<notes[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get a single note by ID
  async getNote(id: string): Promise<notes | null> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create a new note
  async createNote(note: Partial<notes>): Promise<notes> {
    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('notes')
      .insert([{ ...note, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update an existing note
  async updateNote(id: string, updates: Partial<notes>): Promise<notes> {
    const { data, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a note
  async deleteNote(id: string): Promise<void> {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Search notes by title or content
  async searchNotes(query: string): Promise<notes[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get notes by tag
  async getNotesByTag(tag: string): Promise<notes[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .contains('tags', [tag])
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}; 