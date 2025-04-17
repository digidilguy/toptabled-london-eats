
import { createClient } from '@supabase/supabase-js';

// Try to get environment variables, with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Create a Supabase client (will be a mock client if using placeholder values)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to check if we're using real credentials
export const isSupabaseConfigured = () => {
  return import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
};
