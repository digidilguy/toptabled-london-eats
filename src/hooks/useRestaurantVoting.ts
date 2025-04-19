
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useRestaurants } from "@/context/RestaurantContext";

export const useRestaurantVoting = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { userVotes, voteForRestaurant, activeTagIds } = useRestaurants();

  const handleVote = async (restaurantId: string, voteType: 'up' | 'down') => {
    const currentVote = userVotes[restaurantId];
    let voteDelta = 0;
    
    if (currentVote === voteType) {
      voteDelta = voteType === 'up' ? -1 : 1;
    } else if (currentVote) {
      voteDelta = voteType === 'up' ? 2 : -2;
    } else {
      voteDelta = voteType === 'up' ? 1 : -1;
    }

    const newUserVotes = { ...userVotes };
    if (currentVote === voteType) {
      delete newUserVotes[restaurantId];
    } else {
      newUserVotes[restaurantId] = voteType;
    }

    queryClient.setQueryData(['restaurants', 'infinite', { activeTagIds }], (oldData: any) => {
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
    
    queryClient.setQueryData(['user-votes', userVotes], () => newUserVotes);

    toast({
      title: "Processing vote...",
      description: "Your vote is being processed",
    });

    try {
      const result = await voteForRestaurant(restaurantId, voteType);
      
      // Handle the result properly, checking if it has an action property
      if (result && typeof result === 'object' && 'action' in result) {
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
      } else {
        toast({
          title: voteType === 'up' ? "Upvoted!" : "Downvoted!",
          description: `You have ${voteType === 'up' ? 'upvoted' : 'downvoted'} this restaurant`,
        });
      }
    } catch (error) {
      console.error('Vote error:', error);
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
