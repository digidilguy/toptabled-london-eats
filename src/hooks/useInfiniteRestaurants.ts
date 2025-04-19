
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

// Extract query logic to separate function with explicit return type
const fetchRestaurants = async (
  pageParam: number,
  filters: { 
    activeTagIds: string[], 
    activeTagsByCategory?: Record<TagCategory, string[]> 
  }
) => {
  console.log('Fetching with filters:', filters);
  
  // Create the base query
  const query = supabase
    .from('restaurants')
    .select('*')
    .order('vote_count', { ascending: false })
    .range(
      pageParam * RESTAURANTS_PER_PAGE, 
      (pageParam + 1) * RESTAURANTS_PER_PAGE - 1
    );

  // Apply filters if any are active
  if (filters.activeTagIds.length > 0 && filters.activeTagsByCategory) {
    const categories = Object.keys(filters.activeTagsByCategory) as TagCategory[];
    
    categories.forEach(category => {
      const tagsInCategory = filters.activeTagsByCategory![category];
      
      if (!tagsInCategory || tagsInCategory.length === 0) return;
      
      const tagColumn = `${category}_tag`;
      
      if (tagsInCategory.length > 1) {
        query.in(tagColumn, tagsInCategory);
      } else if (tagsInCategory.length === 1) {
        query.eq(tagColumn, tagsInCategory[0]);
      }
    });
  }

  console.log('Final query:', query);
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching restaurants:', error);
    throw error;
  }
  
  console.log('Query returned restaurants:', data?.length || 0);
  return data ? data.map(mapDbRestaurantToModel) : [];
};

export const useInfiniteRestaurants = (filters: { 
  activeTagIds: string[], 
  activeTagsByCategory?: Record<TagCategory, string[]> 
}) => {
  return useInfiniteQuery({
    queryKey: ['restaurants', 'infinite', filters],
    queryFn: async ({ pageParam = 0 }) => {
      // Call the extracted function with correct parameters
      return fetchRestaurants(pageParam, filters);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === RESTAURANTS_PER_PAGE 
        ? allPages.length 
        : undefined;
    },
  });
};
