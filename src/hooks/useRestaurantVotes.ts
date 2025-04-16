
import { useState, useEffect } from 'react';
import { Restaurant } from '@/data/restaurants';
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useRestaurantVotes = (initialRestaurants: Restaurant[]) => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch restaurants from Supabase
  const { data: restaurants = [] } = useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('vote_count', { ascending: false });
      
      if (error) throw error;
      return data as Restaurant[];
    },
    initialData: initialRestaurants
  });

  // Fetch user votes
  const { data: userVotes = {} } = useQuery({
    queryKey: ['user-votes', user?.id],
    queryFn: async () => {
      if (!user?.id) return {};
      
      const { data, error } = await supabase
        .from('restaurant_votes')
        .select('restaurant_id, vote_type')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      return data.reduce((acc, vote) => ({
        ...acc,
        [vote.restaurant_id]: vote.vote_type
      }), {});
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

        // Update restaurant vote count
        const voteChange = voteType === 'up' ? -1 : 1;
        const { error: updateError } = await supabase
          .from('restaurants')
          .update({ 
            vote_count: vote_count => `${vote_count} + ${voteChange}`,
            weekly_vote_increase: weekly_vote_increase => `${weekly_vote_increase} + ${voteChange}`
          })
          .eq('id', restaurantId);
        
        if (updateError) throw updateError;

        return { action: 'removed' };
      }
      
      // If changing vote or voting for the first time
      const voteChange = currentVote 
        ? (voteType === 'up' ? 2 : -2) // Changing from down to up (+2) or up to down (-2)
        : (voteType === 'up' ? 1 : -1); // First time voting
      
      // Start transaction
      const { error: voteError } = await supabase
        .from('restaurant_votes')
        .upsert({
          user_id: user.id,
          restaurant_id: restaurantId,
          vote_type: voteType
        });
      
      if (voteError) throw voteError;
      
      const { error: updateError } = await supabase
        .from('restaurants')
        .update({ 
          vote_count: vote_count => `${vote_count} + ${voteChange}`,
          weekly_vote_increase: weekly_vote_increase => `${weekly_vote_increase} + ${voteChange}`
        })
        .eq('id', restaurantId);
      
      if (updateError) throw updateError;

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
      const newRestaurant: Omit<Restaurant, 'voteCount' | 'weeklyVoteIncrease'> = {
        ...restaurantData,
        id,
        dateAdded: new Date().toISOString().split('T')[0],
        status: isAdmin ? 'approved' : 'pending'
      };

      const { error } = await supabase
        .from('restaurants')
        .insert(newRestaurant);

      if (error) throw error;
      return newRestaurant;
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
