import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Restaurant } from '@/types/restaurant';
import { importInitialData } from '@/lib/supabase';

const mapDbRestaurant = (dbRestaurant: any): Restaurant => ({
  id: dbRestaurant.id,
  name: dbRestaurant.name,
  googleMapsLink: dbRestaurant.google_maps_link || '',
  voteCount: dbRestaurant.vote_count || 0,
  dateAdded: dbRestaurant.date_added || new Date().toISOString().split('T')[0],
  imageUrl: dbRestaurant.image_url || 'https://source.unsplash.com/random/300x200/?restaurant,food',
  weeklyVoteIncrease: dbRestaurant.weekly_vote_increase || 0,
  status: dbRestaurant.status || 'pending',
  area_tag: dbRestaurant.area_tag,
  cuisine_tag: dbRestaurant.cuisine_tag,
  awards_tag: dbRestaurant.awards_tag,
  dietary_tag: dbRestaurant.dietary_tag,
});

export const useRestaurantData = (initialRestaurants: Restaurant[]) => {
  const { data: restaurants = [], refetch: refetchRestaurants } = useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .order('vote_count', { ascending: false });
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
          await importInitialData(initialRestaurants);
          
          const { data: refreshedData, error: refreshError } = await supabase
            .from('restaurants')
            .select('*')
            .order('vote_count', { ascending: false });
            
          if (refreshError) throw refreshError;
          return refreshedData ? refreshedData.map(mapDbRestaurant) : initialRestaurants;
        }
        
        return data.map(mapDbRestaurant);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        return initialRestaurants;
      }
    },
    initialData: initialRestaurants
  });

  return { restaurants, refetchRestaurants };
};
