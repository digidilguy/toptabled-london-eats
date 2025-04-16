
import { useRestaurants } from "@/context/RestaurantContext";
import { ThumbsUp, MapPin } from "lucide-react";
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
          className="flex flex-col p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-medium">{restaurant.name}</h3>
            <div className="flex items-center gap-1.5">
              <ThumbsUp size={18} className="text-green-500" />
              <span className="text-green-500 font-medium">{restaurant.voteCount}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {restaurant.tagIds.map(tagId => {
              const tag = tags.find(t => t.id === tagId);
              return tag && (
                <span 
                  key={tag.id}
                  className="text-sm px-3 py-1 bg-gray-100 rounded-md text-gray-600"
                >
                  {tag.name}
                </span>
              );
            })}
            
            <a 
              href={restaurant.googleMapsLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors ml-auto"
            >
              <MapPin size={16} />
              <span>View on Maps</span>
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RestaurantGrid;
