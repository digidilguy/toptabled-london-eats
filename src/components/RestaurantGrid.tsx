import { useRestaurants } from "@/context/RestaurantContext";
import { MapPin, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect } from "react";
import { useInfiniteRestaurants } from "@/hooks/useInfiniteRestaurants";
import { useInView } from "react-intersection-observer";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const RestaurantGrid = () => {
  const { voteForRestaurant, userVotes, activeTagIds, activeTagsByCategory } = useRestaurants();
  const { ref: loadMoreRef, inView } = useInView();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteRestaurants({ 
    activeTagIds, 
    activeTagsByCategory 
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Handle voting with optimistic updates
  const handleVote = (restaurantId: string, voteType: 'up' | 'down') => {
    // Determine what the new vote count should be based on current user vote state
    const currentVote = userVotes[restaurantId];
    let voteDelta = 0;
    
    if (currentVote === voteType) {
      // User is removing their vote
      voteDelta = voteType === 'up' ? -1 : 1;
    } else if (currentVote) {
      // User is changing their vote (e.g., from up to down)
      voteDelta = voteType === 'up' ? 2 : -2;
    } else {
      // User is voting for the first time
      voteDelta = voteType === 'up' ? 1 : -1;
    }

    // Create optimistic update for user votes
    const newUserVotes = { ...userVotes };
    if (currentVote === voteType) {
      // Removing vote
      delete newUserVotes[restaurantId];
    } else {
      // Adding or changing vote
      newUserVotes[restaurantId] = voteType;
    }

    // Immediately update the UI with optimistic update
    queryClient.setQueryData(['restaurants', 'infinite', { activeTagIds }], (oldData: any) => {
      if (!oldData) return oldData;
      
      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => 
          page.map((restaurant: any) => 
            restaurant.id === restaurantId 
              ? { 
                  ...restaurant, 
                  voteCount: restaurant.voteCount + voteDelta 
                } 
              : restaurant
          )
        )
      };
    });
    
    // Also update userVotes in the cache
    queryClient.setQueryData(['user-votes', userVotes], () => newUserVotes);

    // Show loading toast
    toast({
      title: "Processing vote...",
      description: "Your vote is being processed",
    });

    // Then perform the actual vote
    voteForRestaurant(restaurantId, voteType)
      .then(() => {
        // Show success toast
        toast({
          title: currentVote === voteType 
            ? "Vote removed" 
            : voteType === 'up' 
              ? "Upvoted!" 
              : "Downvoted!",
          description: currentVote === voteType
            ? "Your vote has been removed"
            : `You have ${voteType === 'up' ? 'upvoted' : 'downvoted'} this restaurant`,
        });
      })
      .catch(error => {
        console.error('Vote error:', error);
        // Revert optimistic update on error
        queryClient.invalidateQueries({ queryKey: ['restaurants', 'infinite'] });
        queryClient.invalidateQueries({ queryKey: ['user-votes'] });
        
        toast({
          title: "Error",
          description: "An error occurred while voting. Please try again.",
          variant: "destructive",
        });
      });
  };

  if (status === 'pending') {
    return (
      <div className="text-center py-12 px-4 rounded-lg border border-neutral/10 bg-white/50 backdrop-blur-sm">
        <h3 className="text-xl font-medium mb-2">Loading restaurants...</h3>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="text-center py-12 px-4 rounded-lg border border-neutral/10 bg-white/50 backdrop-blur-sm">
        <h3 className="text-xl font-medium mb-2">Error loading restaurants</h3>
        <p className="text-neutral">Please try again later.</p>
      </div>
    );
  }

  const allRestaurants = data?.pages.flatMap(page => page) ?? [];

  if (!allRestaurants.length) {
    return (
      <div className="text-center py-12 px-4 rounded-lg border border-neutral/10 bg-white/50 backdrop-blur-sm">
        <h3 className="text-xl font-medium mb-2">No restaurants found</h3>
        <p className="text-neutral">Try removing some filters or check back later for new additions!</p>
      </div>
    );
  }

  // Function to get all tags for a restaurant and filter out null values
  const getRestaurantTags = (restaurant) => {
    const restaurantTags = [];
    if (restaurant.area_tag) restaurantTags.push(restaurant.area_tag);
    if (restaurant.cuisine_tag) restaurantTags.push(restaurant.cuisine_tag);
    if (restaurant.awards_tag) restaurantTags.push(restaurant.awards_tag);
    if (restaurant.dietary_tag) restaurantTags.push(restaurant.dietary_tag);
    
    return restaurantTags;
  };

  // Convert tag ID to display name
  const getTagDisplayName = (tagId: string) => {
    return tagId.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="space-y-4">
      {allRestaurants.map((restaurant) => (
        <div 
          key={restaurant.id}
          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex-1 space-y-3 sm:space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg text-accent">{restaurant.name}</h3>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleVote(restaurant.id, 'up')}
                  className={userVotes[restaurant.id] === 'up' 
                    ? "text-upvote hover:text-upvote/80" 
                    : "text-muted-foreground hover:text-upvote/80"}
                >
                  <ThumbsUp 
                    size={16} 
                    className={userVotes[restaurant.id] === 'up' ? 'fill-current' : ''} 
                  />
                </Button>
                <span className="text-sm font-medium">{restaurant.voteCount}</span>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleVote(restaurant.id, 'down')}
                  className={userVotes[restaurant.id] === 'down' 
                    ? "text-downvote hover:text-downvote/80" 
                    : "text-muted-foreground hover:text-downvote/80"}
                >
                  <ThumbsDown 
                    size={16} 
                    className={userVotes[restaurant.id] === 'down' ? 'fill-current' : ''} 
                  />
                </Button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex flex-wrap gap-1">
                {getRestaurantTags(restaurant).map(tagId => (
                  <span 
                    key={tagId}
                    className="text-xs px-2 py-0.5 bg-secondary/50 rounded-full text-accent/80"
                  >
                    {getTagDisplayName(tagId)}
                  </span>
                ))}
              </div>
              <a 
                href={restaurant.googleMapsLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                <MapPin size={14} />
                <span>View on Maps</span>
              </a>
            </div>
          </div>
        </div>
      ))}
      
      {/* Loading indicator */}
      <div ref={loadMoreRef} className="py-4 text-center">
        {isFetchingNextPage ? (
          <p className="text-neutral">Loading more restaurants...</p>
        ) : hasNextPage ? (
          <p className="text-neutral">Scroll to load more</p>
        ) : (
          <p className="text-neutral">No more restaurants to load</p>
        )}
      </div>
    </div>
  );
};

export default RestaurantGrid;
