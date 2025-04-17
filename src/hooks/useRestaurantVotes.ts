
import { useState, useEffect } from 'react';
import { Restaurant } from '@/data/restaurants';
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Map database restaurant to our Restaurant type
const mapDbRestaurant = (dbRestaurant: any): Restaurant => ({
  id: dbRestaurant.id,
  name: dbRestaurant.name,
  tagIds: dbRestaurant.tag_ids || [],
  googleMapsLink: dbRestaurant.google_maps_link || '',
  voteCount: dbRestaurant.vote_count || 0,
  dateAdded: dbRestaurant.date_added || new Date().toISOString().split('T')[0],
  imageUrl: dbRestaurant.image_url || 'https://source.unsplash.com/random/300x200/?restaurant,food',
  weeklyVoteIncrease: dbRestaurant.weekly_vote_increase || 0,
  status: dbRestaurant.status || 'pending',
});

export const useRestaurantVotes = (initialRestaurants: Restaurant[]) => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch restaurants from Supabase
  const { data: restaurants = [] } = useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .order('vote_count', { ascending: false });
        
        if (error) throw error;
        
        // If no data returned from Supabase, use initial data
        if (!data || data.length === 0) {
          console.log('No restaurants found in database, using initial data');
          return initialRestaurants;
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

  // Fetch user votes - fixing the issue with invalid UUID
  const { data: userVotes = {} } = useQuery({
    queryKey: ['user-votes', user?.id],
    queryFn: async () => {
      // Check if user is authenticated and has a valid UUID
      if (!user?.id || typeof user.id !== 'string' || !isValidUUID(user.id)) {
        console.log('User not authenticated or invalid UUID, not fetching votes');
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
        const voteMap = data.reduce((acc, vote) => ({
          ...acc,
          [vote.restaurant_id]: vote.vote_type
        }), {});
        
        console.log('User votes retrieved:', voteMap);
        return voteMap;
      } catch (error) {
        console.error('Error fetching user votes:', error);
        return {};
      }
    },
    enabled: !!user?.id && typeof user.id === 'string' && isValidUUID(user.id)
  });

  // Helper function to validate UUID
  function isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({ restaurantId, voteType }: { restaurantId: string, voteType: 'up' | 'down' }) => {
      if (!user?.id || !isValidUUID(user.id)) {
        throw new Error('Must be logged in with a valid user ID to vote');
      }

      console.log('Voting with user ID:', user.id);
      console.log('Restaurant ID:', restaurantId);
      console.log('Vote type:', voteType);

      const currentVote = userVotes[restaurantId];
      
      // If clicking the same vote type, remove the vote
      if (currentVote === voteType) {
        // Delete the vote
        const { error: deleteError } = await supabase
          .from('restaurant_votes')
          .delete()
          .eq('user_id', user.id)
          .eq('restaurant_id', restaurantId);
        
        if (deleteError) throw deleteError;
        return { action: 'removed' };
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
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['user-votes'] });
      
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
        description: error.message,
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
        id: newUuid, // Explicitly adding id as it's now required
        name: restaurantData.name,
        google_maps_link: restaurantData.googleMapsLink,
        image_url: restaurantData.imageUrl,
        tag_ids: restaurantData.tagIds,
        status: isAdmin ? 'approved' : 'pending'
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
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const voteForRestaurant = (restaurantId: string, voteType: 'up' | 'down') => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "You need to log in to vote for restaurants",
        variant: "destructive",
      });
      return;
    }
    
    if (!user?.id || !isValidUUID(user.id)) {
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
