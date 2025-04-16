
import { useRestaurants } from "@/context/RestaurantContext";
import { MapPin, ThumbsUp } from "lucide-react";
import { tags } from "@/data/tags";
import { useEffect } from "react";

const RestaurantGrid = () => {
  const { filteredRestaurants } = useRestaurants();
  
  useEffect(() => {
    console.log("Rendered restaurants:", filteredRestaurants.length);
  }, [filteredRestaurants]);

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
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{restaurant.name}</h3>
              <div className="flex items-center gap-2 text-sm text-neutral">
                <ThumbsUp size={16} className={restaurant.voteCount > 0 ? "text-upvote" : ""} />
                <span>{restaurant.voteCount}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-wrap gap-1">
                {restaurant.tagIds.map(tagId => {
                  const tag = tags.find(t => t.id === tagId);
                  return tag && (
                    <span 
                      key={tag.id}
                      className="text-xs px-2 py-0.5 bg-secondary rounded-full text-neutral"
                    >
                      {tag.name}
                    </span>
                  );
                })}
              </div>
              <a 
                href={restaurant.googleMapsLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-neutral hover:text-accent"
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
