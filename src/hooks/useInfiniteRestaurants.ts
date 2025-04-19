
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Restaurant } from '@/types/restaurant';

const RESTAURANTS_PER_PAGE = 12;

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
      return data as Restaurant[];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === RESTAURANTS_PER_PAGE 
        ? allPages.length 
        : undefined;
    },
  });
};
