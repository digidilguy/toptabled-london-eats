import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Restaurant } from '@/types/restaurant';

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

export const useInfiniteRestaurants = (filters: { activeTagIds: string[] }) => {
  return useInfiniteQuery({
    queryKey: ['restaurants', 'infinite', filters],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('restaurants')
        .select('*')
        .order('vote_count', { ascending: false })
        .range(
          pageParam * RESTAURANTS_PER_PAGE, 
          (pageParam + 1) * RESTAURANTS_PER_PAGE - 1
        );

      // Apply tag filters if any are active
      if (filters.activeTagIds.length > 0) {
        query = filters.activeTagIds.reduce((acc, tagId) => {
          return acc.or(`area_tag.eq.${tagId},cuisine_tag.eq.${tagId},awards_tag.eq.${tagId},dietary_tag.eq.${tagId}`);
        }, query);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      // Map each database restaurant to our Restaurant model
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
