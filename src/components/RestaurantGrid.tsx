
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteRestaurants } from "@/hooks/useInfiniteRestaurants";
import { useRestaurants } from "@/context/RestaurantContext";
import RestaurantCard from "./RestaurantCard";
import RestaurantGridLoading from "./RestaurantGridLoading";
import RestaurantGridError from "./RestaurantGridError";

const RestaurantGrid = () => {
  const { activeTagIds, activeTagsByCategory } = useRestaurants();
  const { ref: loadMoreRef, inView } = useInView();

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

  if (status === 'pending') {
    return <RestaurantGridLoading />;
  }

  if (status === 'error') {
    return <RestaurantGridError />;
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

  return (
    <div className="space-y-4">
      {allRestaurants.map((restaurant) => (
        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
      ))}
      
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
