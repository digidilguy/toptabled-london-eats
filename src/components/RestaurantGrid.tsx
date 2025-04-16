
import { useRestaurants } from "@/context/RestaurantContext";
import RestaurantCard from "./RestaurantCard";
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {filteredRestaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant.id}
          id={restaurant.id}
          name={restaurant.name}
          tagIds={restaurant.tagIds}
          googleMapsLink={restaurant.googleMapsLink}
          voteCount={restaurant.voteCount}
          imageUrl={restaurant.imageUrl}
        />
      ))}
    </div>
  );
};

export default RestaurantGrid;
