
import React, { createContext, useContext } from 'react';
import { restaurants as initialRestaurants } from '@/data/restaurants';
import { RestaurantContextType, RestaurantProviderProps } from '@/types/restaurant';
import { useRestaurantFilters } from '@/hooks/useRestaurantFilters';
import { useRestaurantVotes } from '@/hooks/useRestaurantVotes';

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider: React.FC<RestaurantProviderProps> = ({ children }) => {
  const {
    restaurants,
    userVotes,
    voteForRestaurant,
    addRestaurant,
    getRestaurantById
  } = useRestaurantVotes(initialRestaurants);

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
        addRestaurant,
        getRestaurantById,
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
