
import { supabase } from '@/integrations/supabase/client';
import { restaurants as initialRestaurants } from '@/data/restaurants';

// Function to import initial restaurant data
export const importInitialData = async (initialRestaurants: any[]) => {
  try {
    // Map the restaurants to match database structure
    const dbRestaurants = initialRestaurants.map(restaurant => ({
      id: restaurant.id,
      name: restaurant.name,
      image_url: restaurant.imageUrl,
      google_maps_link: restaurant.googleMapsLink,
      vote_count: restaurant.voteCount,
      weekly_vote_increase: restaurant.weeklyVoteIncrease || 0,
      date_added: restaurant.dateAdded,
      area_tag: restaurant.tagIds.find((t: string) => tags.find(tag => tag.id === t && tag.category === 'area')),
      cuisine_tag: restaurant.tagIds.find((t: string) => tags.find(tag => tag.id === t && tag.category === 'cuisine')),
      awards_tag: restaurant.tagIds.find((t: string) => tags.find(tag => tag.id === t && tag.category === 'awards')),
      dietary_tag: restaurant.tagIds.find((t: string) => tags.find(tag => tag.id === t && tag.category === 'dietary')),
      status: restaurant.status || 'approved'
    }));

    // Insert the restaurants with upsert to handle existing records
    const { error } = await supabase
      .from('restaurants')
      .upsert(dbRestaurants, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      });
    
    if (error) throw error;
    
    return { success: true, count: dbRestaurants.length };
  } catch (error) {
    console.error('Error importing initial data:', error);
    throw error;
  }
};

// Helper function to check if we're connected to Supabase
export const isSupabaseConfigured = () => {
  return true; // We're using the automatically configured client
};

// Function to clear all data from the database
export const clearAllDatabaseData = async () => {
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
