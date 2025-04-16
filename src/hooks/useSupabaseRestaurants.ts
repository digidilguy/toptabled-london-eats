
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Restaurant } from '@/data/restaurants';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useSupabaseRestaurants = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch restaurants with their tags
  const { data: rawRestaurants = [], isLoading } = useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      const { data: restaurants, error } = await supabase
        .from('restaurants')
        .select(`
          *,
          restaurant_tags(
            tags(*)
          )
        `)
        .order('vote_count', { ascending: false });

      if (error) throw error;
      console.log('Supabase response:', restaurants);
      return restaurants;
    }
  });

  // Transform Supabase data to match the Restaurant type
  const restaurants: Restaurant[] = rawRestaurants.map(restaurant => {
    // Extract tag IDs from the restaurant_tags relation
    const tagIds = restaurant.restaurant_tags
      ? restaurant.restaurant_tags.map((rt: any) => rt.tags.id)
      : [];
    
    return {
      id: restaurant.id,
      name: restaurant.name,
      tagIds: tagIds.filter(Boolean), // Remove any empty strings
      googleMapsLink: restaurant.google_maps_link || '',
      voteCount: restaurant.vote_count || 0,
      dateAdded: restaurant.date_added || new Date().toISOString(),
      imageUrl: restaurant.image_url || 'https://source.unsplash.com/random/300x200/?restaurant',
      weeklyVoteIncrease: restaurant.weekly_vote_increase || 0,
      status: restaurant.status as 'pending' | 'approved' | 'rejected' || 'approved',
    };
  });

  // Fetch user votes if authenticated
  const { data: userVotes = {} } = useQuery({
    queryKey: ['user-votes', user?.id],
    queryFn: async () => {
      if (!user) return {};
      
      const { data: votes, error } = await supabase
        .from('votes')
        .select('restaurant_id, vote_type')
        .eq('user_id', user.id);

      if (error) throw error;

      return votes.reduce((acc: Record<string, 'up' | 'down'>, vote) => {
        acc[vote.restaurant_id] = vote.vote_type as 'up' | 'down';
        return acc;
      }, {});
    },
    enabled: !!user
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({ restaurantId, voteType }: { restaurantId: string, voteType: 'up' | 'down' }) => {
      if (!user) {
        throw new Error('Must be logged in to vote');
      }

      const { error } = await supabase
        .from('votes')
        .upsert({
          restaurant_id: restaurantId,
          user_id: user.id,
          vote_type: voteType
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['user-votes'] });
    }
  });

  const voteForRestaurant = async (restaurantId: string, voteType: 'up' | 'down') => {
    try {
      await voteMutation.mutateAsync({ restaurantId, voteType });
      toast({
        title: 'Success!',
        description: `Your vote has been recorded`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'You must be logged in to vote',
        variant: 'destructive',
      });
    }
  };

  return {
    restaurants,
    isLoading,
    userVotes,
    voteForRestaurant
  };
};
