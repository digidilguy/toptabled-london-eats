
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useRestaurants } from "@/context/RestaurantContext";

// Define the expected return type from voteForRestaurant
interface VoteResult {
  action: 'removed' | 'voted';
  type: 'up' | 'down';
}

export const useRestaurantVoting = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { userVotes, voteForRestaurant, activeTagIds, activeTagsByCategory } = useRestaurants();

  const handleVote = async (restaurantId: string, voteType: 'up' | 'down') => {
    const currentVote = userVotes[restaurantId];
    let voteDelta = 0;
    
    if (currentVote === voteType) {
      // User is removing their vote
      voteDelta = voteType === 'up' ? -1 : 1;
    } else if (currentVote) {
      // User is changing their vote from up to down or vice versa (2 point swing)
      voteDelta = voteType === 'up' ? 2 : -2;
    } else {
      // User is adding a new vote
      voteDelta = voteType === 'up' ? 1 : -1;
    }

    const newUserVotes = { ...userVotes };
    if (currentVote === voteType) {
      delete newUserVotes[restaurantId];
    } else {
      newUserVotes[restaurantId] = voteType;
    }

    // Immediately update the UI optimistically
    queryClient.setQueryData(['restaurants', 'infinite', { activeTagIds, activeTagsByCategory }], (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => 
          page.map((restaurant: any) => 
            restaurant.id === restaurantId 
              ? { ...restaurant, voteCount: restaurant.voteCount + voteDelta } 
              : restaurant
          )
        )
      };
    });
    
    // Update user votes cache optimistically
    queryClient.setQueryData(['user-votes'], () => newUserVotes);

    try {
      // Execute the vote and ensure we await the promise
      const result: VoteResult = await voteForRestaurant(restaurantId, voteType);
      
      // Now we can safely check the result
      toast({
        title: result.action === 'removed' 
          ? "Vote removed" 
          : voteType === 'up' 
            ? "Upvoted!" 
            : "Downvoted!",
        description: result.action === 'removed'
          ? "Your vote has been removed"
          : `You have ${voteType === 'up' ? 'upvoted' : 'downvoted'} this restaurant`,
      });
    } catch (error) {
      console.error('Vote error:', error);
      
      // Revert the optimistic update if the operation failed
      queryClient.invalidateQueries({ queryKey: ['restaurants', 'infinite'] });
      queryClient.invalidateQueries({ queryKey: ['user-votes'] });
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while voting",
        variant: "destructive",
      });
    }
  };

  return { handleVote, userVotes };
};
