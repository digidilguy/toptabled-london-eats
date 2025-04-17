
import { createClient } from '@supabase/supabase-js';

// Try to get environment variables, with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Create a Supabase client (will be a mock client if using placeholder values)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to check if we're using real credentials
export const isSupabaseConfigured = () => {
  return !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY 
    && import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder-url.supabase.co';
};

// Function to clear all data from the database
export const clearAllDatabaseData = async () => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured with valid credentials');
  }
  
  try {
    // First clear restaurant_votes table (has foreign key constraints)
    const { error: votesError } = await supabase
      .from('restaurant_votes')
      .delete()
      .neq('restaurant_id', 'non-existent-id'); // Trick to delete all rows
      
    if (votesError) throw votesError;
    
    // Then clear restaurants table
    const { error: restaurantsError } = await supabase
      .from('restaurants')
      .delete()
      .neq('id', 'non-existent-id'); // Trick to delete all rows
    
    if (restaurantsError) throw restaurantsError;
    
    return { success: true };
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
};
