
import { Restaurant } from '@/types/restaurant';
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { submitRestaurant } from '@/lib/supabase';
import { useMockUserVotes } from './useMockUserVotes';
import { useRestaurantData } from './useRestaurantData';
import { handleMockVote, handleDatabaseVote } from '@/utils/voteHandlers';

export const useRestaurantVotes = (initialRestaurants: Restaurant[]) => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mockUserVotes, setMockUserVotes, isMockUser } = useMockUserVotes(user?.id);
  const { restaurants, refetchRestaurants } = useRestaurantData(initialRestaurants);

  const { data: userVotes = {}, refetch: refetchUserVotes } = useQuery({
    queryKey: ['user-votes', user?.id],
    queryFn: async () => {
      if (!isAuthenticated || !user?.id) {
        return {};
      }
      
      if (isMockUser(user.id)) {
        return mockUserVotes;
      }
      
      try {
        const { data, error } = await supabase
          .from('restaurant_votes')
          .select('restaurant_id, vote_type')
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        const voteMap: Record<string, 'up' | 'down'> = {};
        data.forEach(vote => {
          if (vote.vote_type === 'up' || vote.vote_type === 'down') {
            voteMap[vote.restaurant_id] = vote.vote_type;
          }
        });
        
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

      if (isMockUser(user.id)) {
        return handleMockVote(restaurantId, voteType, mockUserVotes, setMockUserVotes);
      }
      
      return handleDatabaseVote(user.id, restaurantId, voteType, userVotes[restaurantId]);
    },
    onSuccess: (result, variables) => {
      if (!isMockUser(user?.id)) {
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
      return submitRestaurant(restaurantData, isAdmin);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      toast({
        title: isAdmin ? "Restaurant added" : "Restaurant submitted for review",
        description: isAdmin 
          ? "Restaurant has been added to the list" 
          : "Restaurant has been submitted and will be reviewed by an admin",
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

  const voteForRestaurant = (restaurantId: string, voteType: 'up' | 'down'): Promise<any> => {
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

  return {
    restaurants,
    userVotes,
    voteForRestaurant,
    addRestaurant: (data: Omit<Restaurant, 'id' | 'voteCount' | 'dateAdded' | 'weeklyVoteIncrease' | 'status'>) => 
      addRestaurantMutation.mutate(data),
    getRestaurantById: (id: string) => restaurants.find(restaurant => restaurant.id === id)
  };
};
