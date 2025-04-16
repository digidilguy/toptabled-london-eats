
import React, { createContext, useContext } from 'react';
import { RestaurantContextType, RestaurantProviderProps } from '@/types/restaurant';
import { useSupabaseRestaurants } from '@/hooks/useSupabaseRestaurants';
import { useRestaurantFilters } from '@/hooks/useRestaurantFilters';

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider: React.FC<RestaurantProviderProps> = ({ children }) => {
  const {
    restaurants,
    userVotes,
    voteForRestaurant,
  } = useSupabaseRestaurants();

  const {
    activeTagIds,
    filteredRestaurants,
    trendingRestaurants,
    toggleTagFilter,
    clearTagFilters
  } = useRestaurantFilters(restaurants);

  return (
    <RestaurantContext.Provider
      value={{
        restaurants,
        trendingRestaurants,
        filteredRestaurants,
        activeTagIds,
        toggleTagFilter,
        clearTagFilters,
        voteForRestaurant,
        addRestaurant: () => {}, // To be implemented
        getRestaurantById: (id) => restaurants.find(r => r.id === id),
        userVotes
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurants = () => {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error('useRestaurants must be used within a RestaurantProvider');
  }
  return context;
};
