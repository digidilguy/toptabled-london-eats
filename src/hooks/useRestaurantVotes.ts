
import { useState, useEffect } from 'react';
import { Restaurant } from '@/types/restaurant';
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Map database restaurant to our Restaurant type
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

// Helper function to validate UUID
function isValidUUID(id: string | undefined): boolean {
  if (!id) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// Helper function to check if user is a mock user (using string IDs like '1', '2', '3')
function isMockUser(userId: string | undefined): boolean {
  if (!userId) return false;
  return ['1', '2', '3', '4', '5'].includes(userId);
}

export const useRestaurantVotes = (initialRestaurants: Restaurant[]) => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State to track mock user votes (for testing only) - Fixed type to be 'up' | 'down'
  const [mockUserVotes, setMockUserVotes] = useState<Record<string, 'up' | 'down'>>({});

  // Fetch restaurants from Supabase
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
        
        // If no data returned from Supabase, import initial data automatically
        if (!data || data.length === 0) {
          console.log('No restaurants found in database, importing initial data...');
          await importInitialData();
          
          // Try fetching again after import
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
        // Use initial data as fallback
        return initialRestaurants;
      }
    },
    initialData: initialRestaurants
  });

  // Fetch user votes 
  const { data: userVotes = {}, refetch: refetchUserVotes } = useQuery({
    queryKey: ['user-votes', user?.id],
    queryFn: async () => {
      // Check if user is authenticated
      if (!isAuthenticated || !user?.id) {
        console.log('User not authenticated, not fetching votes');
        return {};
      }
      
      // For mock users, return from local state instead of Supabase
      if (isMockUser(user.id)) {
        console.log('Mock user detected, using mock vote storage');
        return mockUserVotes;
      }
      
      // Only try to fetch from Supabase if it's a valid UUID
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
        
        // Convert array to object mapping restaurant_id -> vote_type
        const voteMap: Record<string, 'up' | 'down'> = {};
        data.forEach(vote => {
          // Ensure vote_type is only 'up' or 'down'
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

  // Vote mutation
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
      
      // Handle votes for mock users (in-memory)
      if (isMockUser(user.id)) {
        console.log('Processing mock user vote');
        
        // If clicking the same vote type, remove the vote
        if (currentVote === voteType) {
          setMockUserVotes(prev => {
            const newVotes = { ...prev };
            delete newVotes[restaurantId];
            return newVotes;
          });
          
          // Update the restaurant directly in memory
          const restaurantToUpdate = restaurants.find(r => r.id === restaurantId);
          if (restaurantToUpdate) {
            // Remove vote (decrease count by 1 for up, increase by 1 for down)
            const voteChange = voteType === 'up' ? -1 : 1;
            
            // Update the vote count directly in cache
            queryClient.setQueryData(['restaurants'], (oldData: Restaurant[] | undefined) => {
              return oldData?.map(r => 
                r.id === restaurantId 
                  ? { ...r, voteCount: r.voteCount + voteChange } 
                  : r
              );
            });
          }
          
          return { action: 'removed', type: voteType };
        }
        
        // If changing vote, first remove the previous vote impact
        if (currentVote) {
          const prevVoteChange = currentVote === 'up' ? -1 : 1;
          
          // Update the vote count directly in cache to remove previous vote
          queryClient.setQueryData(['restaurants'], (oldData: Restaurant[] | undefined) => {
            return oldData?.map(r => 
              r.id === restaurantId 
                ? { ...r, voteCount: r.voteCount + prevVoteChange } 
                : r
            );
          });
        }
        
        // Now add the new vote
        setMockUserVotes(prev => ({
          ...prev,
          [restaurantId]: voteType
        }));
        
        // Update the restaurant directly in memory
        const voteChange = voteType === 'up' ? 1 : -1;
        
        // Update the vote count directly in cache
        queryClient.setQueryData(['restaurants'], (oldData: Restaurant[] | undefined) => {
          return oldData?.map(r => 
            r.id === restaurantId 
              ? { ...r, voteCount: r.voteCount + voteChange } 
              : r
          );
        });
        
        return { action: 'voted', type: voteType };
      }
      
      // Real users with Supabase
      else {
        // Only validate UUID for real users, not mock users
        if (!isValidUUID(user.id)) {
          console.error('Invalid UUID for real user:', user.id);
          throw new Error('Your user ID is not a valid UUID');
        }
        
        // If clicking the same vote type, remove the vote
        if (currentVote === voteType) {
          // Delete the vote
          const { error: deleteError } = await supabase
            .from('restaurant_votes')
            .delete()
            .eq('user_id', user.id)
            .eq('restaurant_id', restaurantId);
          
          if (deleteError) throw deleteError;
          return { action: 'removed', type: voteType };
        }
        
        // If changing vote or voting for the first time
        const { error: voteError } = await supabase
          .from('restaurant_votes')
          .upsert({
            user_id: user.id,
            restaurant_id: restaurantId,
            vote_type: voteType
          });
        
        if (voteError) throw voteError;
        
        return { action: 'voted', type: voteType };
      }
    },
    onSuccess: (result, variables) => {
      // Refetch restaurants to get updated vote counts
      if (isMockUser(user?.id)) {
        // For mock users, no need to refetch as we updated the cache directly
      } else {
        // For real users, refetch to get updated vote counts from trigger
        setTimeout(() => {
          refetchRestaurants();
          refetchUserVotes();
        }, 500); // Small delay to ensure DB trigger has time to run
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

  // Add restaurant mutation
  const addRestaurantMutation = useMutation({
    mutationFn: async (restaurantData: Omit<Restaurant, 'id' | 'voteCount' | 'dateAdded' | 'status' | 'weeklyVoteIncrease'>) => {
      if (!isAuthenticated) throw new Error('Must be logged in to add restaurants');
      
      // Generate a new UUID - needed for the database
      const newUuid = crypto.randomUUID();
      
      // Create restaurant object with all required fields including id
      const newRestaurant = {
        id: newUuid, 
        name: restaurantData.name,
        google_maps_link: restaurantData.googleMapsLink,
        image_url: restaurantData.imageUrl,
        status: isAdmin ? 'approved' : 'pending',
        area_tag: restaurantData.area_tag,
        cuisine_tag: restaurantData.cuisine_tag,
        awards_tag: restaurantData.awards_tag,
        dietary_tag: restaurantData.dietary_tag
      };

      const { data, error } = await supabase
        .from('restaurants')
        .insert(newRestaurant)
        .select()
        .single();

      if (error) throw error;
      
      // Return mapped restaurant for UI
      return mapDbRestaurant(data);
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

  // Automatically import initial data if no restaurants found
  const importInitialData = async () => {
    try {
      console.log('Importing initial restaurant data to Supabase...');
      
      // Map the restaurants to match database structure
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

      // Insert the restaurants with upsert to handle existing records
      const { error } = await supabase
        .from('restaurants')
        .upsert(dbRestaurants, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });
      
      if (error) {
        // If there's an error here, it might be due to RLS. 
        // Let's try to use the importInitialData function from lib/supabase
        console.error('Error importing initial data directly:', error);
        console.log('Trying to import using lib/supabase function...');
        
        // Use the importInitialData function from lib/supabase
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
      return;
    }
    
    if (!user?.id) {
      toast({
        title: "Invalid user ID",
        description: "Your user ID is not valid for voting",
        variant: "destructive",
      });
      return;
    }
    
    voteMutation.mutate({ restaurantId, voteType });
  };

  const addRestaurant = (restaurantData: Omit<Restaurant, 'id' | 'voteCount' | 'dateAdded' | 'status' | 'weeklyVoteIncrease'>) => {
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
