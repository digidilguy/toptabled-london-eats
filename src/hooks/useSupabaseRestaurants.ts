
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Restaurant } from '@/data/restaurants';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useSupabaseRestaurants = () => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Fetch all tags first to have their data available
  const { data: tagsData = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data: tags, error } = await supabase
        .from('tags')
        .select('*');

      if (error) throw error;
      console.log('Supabase tags:', tags);
      return tags;
    }
  });

  // Fetch restaurants with their tags
  const { data: rawRestaurants = [], isLoading } = useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      const { data: restaurants, error } = await supabase
        .from('restaurants')
        .select(`
          *,
          restaurant_tags(
            tag_id,
            tags(id, name)
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
    // Extract tag IDs and names from the restaurant_tags relation
    const tagIds = restaurant.restaurant_tags
      ? restaurant.restaurant_tags.map((rt: any) => rt.tag_id)
      : [];
    
    // Also extract tag data to have name information
    const tagData = restaurant.restaurant_tags
      ? restaurant.restaurant_tags.map((rt: any) => ({
          id: rt.tag_id,
          name: rt.tags?.name || ''
        }))
      : [];
    
    console.log(`Tags for restaurant ${restaurant.name}:`, tagData);
    
    return {
      id: restaurant.id,
      name: restaurant.name,
      tagIds: tagIds.filter(Boolean), // Remove any empty strings
      tagData: tagData.filter((t: any) => t.id && t.name), // Include full tag data
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
      
      try {
        const { data: votes, error } = await supabase
          .from('votes')
          .select('restaurant_id, vote_type')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching user votes:', error);
          throw error;
        }
        
        console.log('User votes:', votes);
        return votes.reduce((acc: Record<string, 'up' | 'down'>, vote) => {
          acc[vote.restaurant_id] = vote.vote_type as 'up' | 'down';
          return acc;
        }, {});
      } catch (error) {
        console.error('Failed to fetch user votes:', error);
        return {};
      }
    },
    enabled: !!user
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({ restaurantId, voteType }: { restaurantId: string, voteType: 'up' | 'down' }) => {
      if (!user) {
        throw new Error('Must be logged in to vote');
      }

      console.log(`Submitting vote: ${voteType} for restaurant ${restaurantId} by user ${user.id}`);

      try {
        const { error } = await supabase
          .from('votes')
          .upsert({
            restaurant_id: restaurantId,
            user_id: user.id,
            vote_type: voteType
          });

        if (error) {
          console.error('Vote error:', error);
          throw error;
        }
      } catch (err) {
        console.error('Vote operation failed:', err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['user-votes'] });
    }
  });

  const voteForRestaurant = async (restaurantId: string, voteType: 'up' | 'down') => {
    console.log(`Vote requested for ${restaurantId}, type: ${voteType}`);
    console.log('Authentication status:', { isAuthenticated, user });
    
    if (!isAuthenticated || !user) {
      console.log('Not authenticated, showing toast');
      toast({
        title: 'Authentication required',
        description: 'You need to log in to vote for restaurants',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('Submitting vote mutation');
      await voteMutation.mutateAsync({ restaurantId, voteType });
      toast({
        title: 'Success!',
        description: `Your vote has been recorded`,
      });
    } catch (error) {
      console.error('Vote error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to record your vote',
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
