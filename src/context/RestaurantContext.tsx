
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Restaurant, restaurants as initialRestaurants } from '@/data/restaurants';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from './AuthContext';

interface RestaurantContextType {
  restaurants: Restaurant[];
  trendingRestaurants: Restaurant[];
  filteredRestaurants: Restaurant[];
  activeTagIds: string[];
  toggleTagFilter: (tagId: string) => void;
  clearTagFilters: () => void;
  voteForRestaurant: (restaurantId: string, voteType: 'up' | 'down') => void;
  addRestaurant: (restaurant: Omit<Restaurant, 'id' | 'voteCount' | 'dateAdded'>) => void;
  getRestaurantById: (id: string) => Restaurant | undefined;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [trendingRestaurants, setTrendingRestaurants] = useState<Restaurant[]>([]);
  const [activeTagIds, setActiveTagIds] = useState<string[]>([]);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Load restaurants from localStorage or use initial data
  useEffect(() => {
    const storedRestaurants = localStorage.getItem('toptabled-restaurants');
    if (storedRestaurants) {
      try {
        setRestaurants(JSON.parse(storedRestaurants));
      } catch (error) {
        console.error('Failed to parse stored restaurants:', error);
        setRestaurants(initialRestaurants);
      }
    } else {
      setRestaurants(initialRestaurants);
    }
  }, []);

  // Update filtered restaurants when restaurants or active tags change
  useEffect(() => {
    let filtered = [...restaurants];
    
    if (activeTagIds.length > 0) {
      filtered = filtered.filter(restaurant => 
        activeTagIds.some(tagId => restaurant.tagIds.includes(tagId))
      );
    }
    
    // Sort by vote count (descending)
    filtered.sort((a, b) => b.voteCount - a.voteCount);
    
    setFilteredRestaurants(filtered);
    
    // Update trending restaurants (top 5 by vote count)
    setTrendingRestaurants(filtered.slice(0, 5));
    
    // Save to localStorage
    localStorage.setItem('toptabled-restaurants', JSON.stringify(restaurants));
  }, [restaurants, activeTagIds]);

  // Toggle a tag filter on/off
  const toggleTagFilter = (tagId: string) => {
    setActiveTagIds(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  // Clear all tag filters
  const clearTagFilters = () => {
    setActiveTagIds([]);
  };

  // Vote for a restaurant
  const voteForRestaurant = (restaurantId: string, voteType: 'up' | 'down') => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "You need to log in to vote for restaurants",
        variant: "destructive",
      });
      return;
    }

    setRestaurants(prev => 
      prev.map(restaurant => {
        if (restaurant.id === restaurantId) {
          const voteValue = voteType === 'up' ? 1 : -1;
          return {
            ...restaurant,
            voteCount: restaurant.voteCount + voteValue
          };
        }
        return restaurant;
      })
    );
    
    toast({
      title: voteType === 'up' ? "Upvoted!" : "Downvoted!",
      description: `You have ${voteType === 'up' ? 'upvoted' : 'downvoted'} this restaurant`,
    });
  };

  // Add a new restaurant
  const addRestaurant = (restaurantData: Omit<Restaurant, 'id' | 'voteCount' | 'dateAdded'>) => {
    const newRestaurant: Restaurant = {
      ...restaurantData,
      id: (restaurants.length + 1).toString(),
      voteCount: 0,
      dateAdded: new Date().toISOString().split('T')[0],
    };

    setRestaurants(prev => [...prev, newRestaurant]);
    
    toast({
      title: "Restaurant added",
      description: `${restaurantData.name} has been added to the list`,
    });
  };

  // Get a restaurant by ID
  const getRestaurantById = (id: string) => {
    return restaurants.find(restaurant => restaurant.id === id);
  };

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
        getRestaurantById
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
