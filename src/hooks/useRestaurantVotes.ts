import { useState, useEffect } from 'react';
import { Restaurant } from '@/types/restaurant';
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { submitRestaurant } from '@/lib/supabase';

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

function isValidUUID(id: string | undefined): boolean {
  if (!id) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

function isMockUser(userId: string | undefined): boolean {
  if (!userId) return false;
  return ['1', '2', '3', '4', '5'].includes(userId);
}

export const useRestaurantVotes = (initialRestaurants: Restaurant[]) => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [mockUserVotes, setMockUserVotes] = useState<Record<string, 'up' | 'down'>>({});

  useEffect(() => {
    if (isMockUser(user?.id)) {
      const savedVotes = localStorage.getItem(`mockUserVotes_${user?.id}`);
      if (savedVotes) {
        try {
          const parsedVotes = JSON.parse(savedVotes);
          const validVotes: Record<string, 'up' | 'down'> = {};
          Object.entries(parsedVotes).forEach(([key, value]) => {
            if (value === 'up' || value === 'down') {
              validVotes[key] = value as 'up' | 'down';
            }
          });
          setMockUserVotes(validVotes);
        } catch (error) {
          console.error('Error parsing saved votes:', error);
        }
      }
    }
  }, [user?.id]);

  useEffect(() => {
    if (isMockUser(user?.id) && Object.keys(mockUserVotes).length > 0) {
      localStorage.setItem(`mockUserVotes_${user?.id}`, JSON.stringify(mockUserVotes));
    }
  }, [mockUserVotes, user?.id]);

  const { data: restaurants = [], refetch: refetchRestaurants } = useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      try {
        console.log('Fetching restaurants from Supabase...');
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .order('vote_count', { ascending: false });
        
        if (error) {
          console.error('Error fetching restaurants:', error);
          throw error;
        }
        
        console.log('Restaurants retrieved from Supabase:', data);
        
        if (!data || data.length === 0) {
          console.log('No restaurants found in database, importing initial data...');
          await importInitialData();
          
          const { data: refreshedData, error: refreshError } = await supabase
            .from('restaurants')
            .select('*')
            .order('vote_count', { ascending: false });
            
          if (refreshError) throw refreshError;
          console.log('Restaurants after importing initial data:', refreshedData);
          
          return refreshedData ? refreshedData.map(mapDbRestaurant) as Restaurant[] : initialRestaurants;
        }
        
        return data.map(mapDbRestaurant) as Restaurant[];
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        return initialRestaurants;
      }
    },
    initialData: initialRestaurants
  });

  const { data: userVotes = {}, refetch: refetchUserVotes } = useQuery({
    queryKey: ['user-votes', user?.id],
    queryFn: async () => {
      if (!isAuthenticated || !user?.id) {
        console.log('User not authenticated, not fetching votes');
        return {};
      }
      
      if (isMockUser(user.id)) {
        console.log('Mock user detected, using mock vote storage');
        return mockUserVotes;
      }
      
      if (!isValidUUID(user.id)) {
        console.log('Invalid UUID for user ID:', user.id);
        return {};
      }
      
      try {
        console.log('Fetching votes for user:', user.id);
        const { data, error } = await supabase
          .from('restaurant_votes')
          .select('restaurant_id, vote_type')
          .eq('user_id', user.id);
        
        if (error) {
          console.error('Error fetching user votes:', error);
          throw error;
        }
        
        const voteMap: Record<string, 'up' | 'down'> = {};
        data.forEach(vote => {
          if (vote.vote_type === 'up' || vote.vote_type === 'down') {
            voteMap[vote.restaurant_id] = vote.vote_type;
          }
        });
        
        console.log('User votes retrieved:', voteMap);
        return voteMap;
      } catch (error) {
        console.error('Error fetching user votes:', error);
        return {};
      }
    },
    enabled: isAuthenticated && !!user?.id
  });

  const voteMutation = useMutation({
    mutationFn: async ({ restaurantId, voteType }: { restaurantId: string, voteType: 'up' | 'down' }) => {
      if (!isAuthenticated) {
        throw new Error('Must be logged in to vote');
      }
      
      if (!user?.id) {
        throw new Error('Invalid user ID');
      }
      
      console.log('Voting with user ID:', user.id, 'Mock user:', isMockUser(user.id));
      console.log('Restaurant ID:', restaurantId);
      console.log('Vote type:', voteType);

      const currentVote = userVotes[restaurantId];
      
      if (isMockUser(user.id)) {
        console.log('Processing mock user vote');
        
        if (currentVote === voteType) {
          setMockUserVotes(prev => {
            const newVotes = { ...prev };
            delete newVotes[restaurantId];
            return newVotes;
          });
          
          const voteChange = voteType === 'up' ? -1 : 1;
          
          queryClient.setQueryData(['restaurants'], (oldData: Restaurant[] | undefined) => {
            return oldData?.map(r => 
              r.id === restaurantId 
                ? { ...r, voteCount: r.voteCount + voteChange } 
                : r
            );
          });
          
          return { action: 'removed', type: voteType };
        }
        
        if (currentVote) {
          const prevVoteChange = currentVote === 'up' ? -1 : 1;
          
          queryClient.setQueryData(['restaurants'], (oldData: Restaurant[] | undefined) => {
            return oldData?.map(r => 
              r.id === restaurantId 
                ? { ...r, voteCount: r.voteCount + prevVoteChange } 
                : r
            );
          });
        }
        
        setMockUserVotes(prev => ({
          ...prev,
          [restaurantId]: voteType
        }));
        
        const voteChange = voteType === 'up' ? 1 : -1;
        
        queryClient.setQueryData(['restaurants'], (oldData: Restaurant[] | undefined) => {
          return oldData?.map(r => 
            r.id === restaurantId 
              ? { ...r, voteCount: r.voteCount + voteChange } 
              : r
          );
        });
        
        return { action: 'voted', type: voteType };
      }
      
      if (!isValidUUID(user.id)) {
        console.error('Invalid UUID for real user:', user.id);
        throw new Error('Your user ID is not a valid UUID');
      }
      
      if (currentVote === voteType) {
        const { error: deleteError } = await supabase
          .from('restaurant_votes')
          .delete()
          .eq('user_id', user.id)
          .eq('restaurant_id', restaurantId);
        
        if (deleteError) throw deleteError;
        return { action: 'removed', type: voteType };
      }
      
      const { error: voteError } = await supabase
        .from('restaurant_votes')
        .upsert({
          user_id: user.id,
          restaurant_id: restaurantId,
          vote_type: voteType
        });
      
      if (voteError) throw voteError;
      
      return { action: 'voted', type: voteType };
    },
    onSuccess: (result, variables) => {
      if (isMockUser(user?.id)) {
      } else {
        setTimeout(() => {
          refetchRestaurants();
          refetchUserVotes();
        }, 500);
      }
      
      if (result.action === 'removed') {
        toast({
          title: "Vote removed",
          description: "Your vote has been removed",
        });
      } else {
        toast({
          title: variables.voteType === 'up' ? "Upvoted!" : "Downvoted!",
          description: `You have ${variables.voteType === 'up' ? 'upvoted' : 'downvoted'} this restaurant`,
        });
      }
    },
    onError: (error) => {
      console.error('Voting error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while voting",
        variant: "destructive",
      });
    }
  });

  const addRestaurantMutation = useMutation({
    mutationFn: async (restaurantData: Omit<Restaurant, 'id' | 'voteCount' | 'dateAdded' | 'weeklyVoteIncrease' | 'status'>) => {
      if (!isAuthenticated) throw new Error('Must be logged in to add restaurants');
      
      try {
        const result = await submitRestaurant(restaurantData, isAdmin);
        if (!result.restaurant) throw new Error('Failed to add restaurant');
        return mapDbRestaurant(result.restaurant);
      } catch (error) {
        console.error('Error submitting restaurant:', error);
        throw error;
      }
    },
    onSuccess: (restaurant) => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      toast({
        title: isAdmin ? "Restaurant added" : "Restaurant submitted for review",
        description: isAdmin 
          ? `${restaurant.name} has been added to the list` 
          : `${restaurant.name} has been submitted and will be reviewed by an admin`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while adding the restaurant",
        variant: "destructive",
      });
    }
  });

  const importInitialData = async () => {
    try {
      console.log('Importing initial restaurant data to Supabase...');
      
      const dbRestaurants = initialRestaurants.map(restaurant => ({
        id: restaurant.id,
        name: restaurant.name,
        image_url: restaurant.imageUrl,
        google_maps_link: restaurant.googleMapsLink,
        vote_count: restaurant.voteCount,
        weekly_vote_increase: restaurant.weeklyVoteIncrease || 0,
        date_added: restaurant.dateAdded,
        status: restaurant.status || 'approved',
        area_tag: restaurant.area_tag,
        cuisine_tag: restaurant.cuisine_tag,
        awards_tag: restaurant.awards_tag,
        dietary_tag: restaurant.dietary_tag
      }));

      const { error } = await supabase
        .from('restaurants')
        .upsert(dbRestaurants, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error('Error importing initial data directly:', error);
        console.log('Trying to import using lib/supabase function...');
        
        const { importInitialData: libImportInitialData } = await import('@/lib/supabase');
        await libImportInitialData(initialRestaurants);
      }
      
      console.log('Initial data imported successfully');
      return { success: true, count: dbRestaurants.length };
    } catch (error) {
      console.error('Error importing initial data:', error);
      throw error;
    }
  };

  const voteForRestaurant = (restaurantId: string, voteType: 'up' | 'down') => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "You need to log in to vote for restaurants",
        variant: "destructive",
      });
      return Promise.reject(new Error("Authentication required"));
    }
    
    if (!user?.id) {
      toast({
        title: "Invalid user ID",
        description: "Your user ID is not valid for voting",
        variant: "destructive",
      });
      return Promise.reject(new Error("Invalid user ID"));
    }
    
    return new Promise((resolve, reject) => {
      voteMutation.mutate(
        { restaurantId, voteType },
        {
          onSuccess: (data) => resolve(data),
          onError: (error) => reject(error)
        }
      );
    });
  };

  const addRestaurant = (restaurantData: Omit<Restaurant, 'id' | 'voteCount' | 'dateAdded' | 'weeklyVoteIncrease' | 'status'>) => {
    addRestaurantMutation.mutate(restaurantData);
  };

  return {
    restaurants,
    userVotes,
    voteForRestaurant,
    addRestaurant,
    getRestaurantById: (id: string) => restaurants.find(restaurant => restaurant.id === id)
  };
};

async function importInitialData() {
  try {
    console.log('Importing initial restaurant data to Supabase...');
    const { importInitialData: libImportInitialData } = await import('@/lib/supabase');
    const initialData = (await import('@/data/restaurants')).restaurants;
    await libImportInitialData(initialData);
    console.log('Initial data imported successfully');
  } catch (error) {
    console.error('Error importing initial data:', error);
    throw error;
  }
}
