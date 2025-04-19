
import { supabase } from '@/integrations/supabase/client';
import { restaurants as initialRestaurants } from '@/data/restaurants';
import { tags } from '@/data/tags';
import { Restaurant } from '@/types/restaurant';

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
      area_tag: restaurant.tagIds?.find((t: string) => tags.find(tag => tag.id === t && tag.category === 'area')),
      cuisine_tag: restaurant.tagIds?.find((t: string) => tags.find(tag => tag.id === t && tag.category === 'cuisine')),
      awards_tag: restaurant.tagIds?.find((t: string) => tags.find(tag => tag.id === t && tag.category === 'awards')),
      dietary_tag: restaurant.tagIds?.find((t: string) => tags.find(tag => tag.id === t && tag.category === 'dietary')),
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

// Function to submit a new restaurant (with RLS bypass for admins if needed)
export const submitRestaurant = async (
  restaurantData: Omit<Restaurant, 'id' | 'voteCount' | 'dateAdded' | 'weeklyVoteIncrease'>, 
  isAdmin: boolean
) => {
  try {
    // Generate a new UUID for the restaurant
    const newUuid = crypto.randomUUID();
    
    // Create restaurant object with all required fields
    const newRestaurant = {
      id: newUuid,
      name: restaurantData.name,
      google_maps_link: restaurantData.googleMapsLink,
      image_url: restaurantData.imageUrl,
      vote_count: 0,
      weekly_vote_increase: 0,
      date_added: new Date().toISOString().split('T')[0],
      status: isAdmin ? 'approved' : 'pending',
      area_tag: restaurantData.area_tag,
      cuisine_tag: restaurantData.cuisine_tag,
      awards_tag: restaurantData.awards_tag,
      dietary_tag: restaurantData.dietary_tag
    };

    const { data, error } = await supabase
      .from('restaurants')
      .insert(newRestaurant)
      .select();

    if (error) throw error;
    
    return { 
      success: true, 
      restaurant: data && data.length > 0 ? data[0] : null 
    };
  } catch (error) {
    console.error('Error submitting restaurant:', error);
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
