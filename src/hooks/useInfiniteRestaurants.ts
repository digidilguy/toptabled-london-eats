import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Restaurant, TagCategory } from '@/types/restaurant';
import { applyRestaurantFilters } from '@/utils/restaurantFilters';

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
      
      const baseQuery = supabase
        .from('restaurants')
        .select('*')
        .order('vote_count', { ascending: false })
        .range(
          pageParam * RESTAURANTS_PER_PAGE, 
          (pageParam + 1) * RESTAURANTS_PER_PAGE - 1
        );

      const query = applyRestaurantFilters(baseQuery, filters);

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching restaurants:', error);
        throw error;
      }
      
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
