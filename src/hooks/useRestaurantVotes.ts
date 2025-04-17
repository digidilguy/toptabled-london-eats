
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
  const { data: userVotes = {} } = useQuery({
    queryKey: ['user-votes', user?.id],
    queryFn: async () => {
      if (!user?.id) return {};
      
      try {
        const { data, error } = await supabase
          .from('restaurant_votes')
          .select('restaurant_id, vote_type')
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        return data.reduce((acc, vote) => ({
          ...acc,
          [vote.restaurant_id]: vote.vote_type
        }), {});
      } catch (error) {
        console.error('Error fetching user votes:', error);
        return {};
      }
    },
    enabled: !!user?.id
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({ restaurantId, voteType }: { restaurantId: string, voteType: 'up' | 'down' }) => {
      if (!user?.id) throw new Error('Must be logged in to vote');

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
      
      const id = restaurantData.name.toLowerCase().replace(/\s+/g, '-');
      const newRestaurant = {
        id,
        name: restaurantData.name,
        google_maps_link: restaurantData.googleMapsLink,
        image_url: restaurantData.imageUrl,
        tag_ids: restaurantData.tagIds,
        status: isAdmin ? 'approved' : 'pending'
      };

      const { error } = await supabase
        .from('restaurants')
        .insert(newRestaurant);

      if (error) throw error;
      
      // Return mapped restaurant for UI
      return mapDbRestaurant({
        ...newRestaurant,
        vote_count: 0,
        date_added: new Date().toISOString().split('T')[0],
        weekly_vote_increase: 0
      });
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
