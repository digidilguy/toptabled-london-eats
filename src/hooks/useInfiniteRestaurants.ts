
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Restaurant, TagCategory } from '@/types/restaurant';

const RESTAURANTS_PER_PAGE = 24;

// Helper function to map database response to our Restaurant type
const mapDbRestaurantToModel = (dbRestaurant: any): Restaurant => ({
  id: dbRestaurant.id,
  name: dbRestaurant.name,
  googleMapsLink: dbRestaurant.google_maps_link || '',
  voteCount: dbRestaurant.vote_count || 0,
  dateAdded: dbRestaurant.date_added || '',
  imageUrl: dbRestaurant.image_url || '',
  weeklyVoteIncrease: dbRestaurant.weekly_vote_increase || 0,
  status: dbRestaurant.status || 'pending',
  area_tag: dbRestaurant.area_tag,
  cuisine_tag: dbRestaurant.cuisine_tag,
  awards_tag: dbRestaurant.awards_tag,
  dietary_tag: dbRestaurant.dietary_tag,
});

export const useInfiniteRestaurants = (filters: { 
  activeTagIds: string[], 
  activeTagsByCategory?: Record<TagCategory, string[]> 
}) => {
  return useInfiniteQuery({
    queryKey: ['restaurants', 'infinite', filters],
    queryFn: async ({ pageParam = 0 }) => {
      console.log('Fetching with filters:', filters);
      
      // Start with the base query
      let query = supabase
        .from('restaurants')
        .select('*')
        .order('vote_count', { ascending: false })
        .range(
          pageParam * RESTAURANTS_PER_PAGE, 
          (pageParam + 1) * RESTAURANTS_PER_PAGE - 1
        );

      // Apply tag filters if any are active
      if (filters.activeTagIds.length > 0 && filters.activeTagsByCategory) {
        // Get all categories with active filters
        const categories = Object.keys(filters.activeTagsByCategory) as TagCategory[];
        
        // Apply AND logic across different categories
        categories.forEach(category => {
          const tagsInCategory = filters.activeTagsByCategory![category];
          
          // Skip empty categories
          if (!tagsInCategory || tagsInCategory.length === 0) return;
          
          const tagColumn = `${category}_tag`;
          
          // Fix the deep type instantiation issue with explicit array casting
          if (tagsInCategory.length > 1) {
            // Create a fixed array of strings to avoid type recursion
            const fixedTagArray: string[] = [...tagsInCategory];
            query = query.in(tagColumn, fixedTagArray);
          } else {
            query = query.eq(tagColumn, tagsInCategory[0]);
          }
        });
      }

      console.log('Final query:', query);
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching restaurants:', error);
        throw error;
      }
      
      // Map each database restaurant to our Restaurant model
      console.log('Query returned restaurants:', data?.length || 0);
      return data ? data.map(mapDbRestaurantToModel) : [];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === RESTAURANTS_PER_PAGE 
        ? allPages.length 
        : undefined;
    },
  });
};
