
import { useRestaurants } from "@/context/RestaurantContext";
import { MapPin, ThumbsDown, ThumbsUp } from "lucide-react";
import { tags } from "@/data/tags";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useAuth } from "@/context/AuthContext";

const RestaurantGrid = () => {
  const { filteredRestaurants, voteForRestaurant, userVotes } = useRestaurants();
  const { isAuthenticated, user } = useAuth();

  console.log("RestaurantGrid rendering with:", filteredRestaurants.length, "restaurants");
  console.log("User votes:", userVotes);
  console.log("Current user:", user);
  
  if (filteredRestaurants.length > 0) {
    console.log("Restaurant data sample:", filteredRestaurants[0]);
    console.log("First restaurant tags:", filteredRestaurants[0].tagIds);
    console.log("First restaurant tag data:", filteredRestaurants[0].tagData);
  }

  if (!filteredRestaurants.length) {
    return (
      <div className="text-center py-12 px-4 rounded-lg border border-neutral/10 bg-white/50 backdrop-blur-sm">
        <h3 className="text-xl font-medium mb-2">No restaurants found</h3>
        <p className="text-neutral">Try removing some filters or check back later for new additions!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredRestaurants.map((restaurant) => (
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
                  onClick={() => voteForRestaurant(restaurant.id, 'up')}
                  className="text-upvote hover:text-upvote/80"
                  disabled={!isAuthenticated}
                  title={!isAuthenticated ? "Login to vote" : "Upvote"}
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
                  onClick={() => voteForRestaurant(restaurant.id, 'down')}
                  className="text-downvote hover:text-downvote/80"
                  disabled={!isAuthenticated}
                  title={!isAuthenticated ? "Login to vote" : "Downvote"}
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
                {restaurant.tagIds && restaurant.tagIds.length > 0 ? (
                  restaurant.tagIds.map((tagId, index) => {
                    // First try to get the tag name from tagData if available
                    const tagName = restaurant.tagData && restaurant.tagData[index] 
                      ? restaurant.tagData[index].name 
                      : null;
                    
                    // Fallback to lookup from local tags if needed
                    const localTag = tags.find(t => t.id === tagId);
                    const displayName = tagName || (localTag ? localTag.name : tagId);
                    
                    return (
                      <Badge 
                        key={tagId}
                        variant="secondary"
                        className="text-xs px-2 py-0.5 bg-secondary/50 rounded-full text-accent/80"
                      >
                        {displayName}
                      </Badge>
                    );
                  })
                ) : (
                  <span className="text-xs text-neutral">No tags</span>
                )}
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
    </div>
  );
};

export default RestaurantGrid;
