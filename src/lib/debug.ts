import { supabase } from './supabaseClient';

export const debugAuth = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  console.log('Current user:', user);
  console.log('User ID:', user?.id);
  console.log('Auth error:', error);
  
  return { user, error };
}; 