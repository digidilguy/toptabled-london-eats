
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
  userVotes: Record<string, 'up' | 'down'>;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

interface RestaurantProviderProps {
  children: React.ReactNode;
  initialTagIds?: string;
}

export const RestaurantProvider: React.FC<RestaurantProviderProps> = ({ children, initialTagIds = '' }) => {
  // Initialize with the static data first - this ensures data is always available immediately
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(initialRestaurants);
  const [trendingRestaurants, setTrendingRestaurants] = useState<Restaurant[]>(initialRestaurants.slice(0, 5));
  const [activeTagIds, setActiveTagIds] = useState<string[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();

  // Parse tags from URL
  useEffect(() => {
    if (initialTagIds) {
      const tagsParam = new URLSearchParams(initialTagIds).get('tags');
      if (tagsParam) {
        const tagIds = tagsParam.split(',');
        setActiveTagIds(tagIds);
      }
    }
  }, [initialTagIds]);

  // Load restaurants from localStorage or use initial data
  useEffect(() => {
    const storedRestaurants = localStorage.getItem('topbites-restaurants');
    if (storedRestaurants) {
      try {
        const parsedRestaurants = JSON.parse(storedRestaurants);
        setRestaurants(parsedRestaurants);
        
        // Also update filtered restaurants initially
        let filtered = [...parsedRestaurants];
        if (activeTagIds.length > 0) {
          // Changed filtering logic to require ALL selected tags to be present
          filtered = filtered.filter(restaurant => 
            activeTagIds.every(tagId => restaurant.tagIds.includes(tagId))
          );
        }
        filtered.sort((a, b) => b.voteCount - a.voteCount);
        setFilteredRestaurants(filtered);
        
        // Sort trending restaurants by weekly vote increase
        const trending = [...filtered].sort((a, b) => 
          (b.weeklyVoteIncrease || 0) - (a.weeklyVoteIncrease || 0)
        ).slice(0, 5);
        setTrendingRestaurants(trending);
      } catch (error) {
        console.error('Failed to parse stored restaurants:', error);
        setRestaurants(initialRestaurants);
      }
    } else {
      // Initial data already set in state initialization, just save it to localStorage
      localStorage.setItem('topbites-restaurants', JSON.stringify(initialRestaurants));
    }
    
    // Load user votes from localStorage
    if (isAuthenticated && user?.email) {
      const storedVotes = localStorage.getItem(`topbites-votes-${user.email}`);
      if (storedVotes) {
        try {
          setUserVotes(JSON.parse(storedVotes));
        } catch (error) {
          console.error('Failed to parse stored votes:', error);
        }
      }
    }
  }, [isAuthenticated, user, activeTagIds]);

  // Update filtered restaurants when restaurants or active tags change
  useEffect(() => {
    let filtered = [...restaurants];
    
    if (activeTagIds.length > 0) {
      // Changed filtering logic to require ALL selected tags to be present
      filtered = filtered.filter(restaurant => 
        activeTagIds.every(tagId => restaurant.tagIds.includes(tagId))
      );
    }
    
    // Sort by vote count (descending)
    filtered.sort((a, b) => b.voteCount - a.voteCount);
    
    console.log("Active tag IDs:", activeTagIds);
    console.log("Filtered results:", filtered.length);
    
    setFilteredRestaurants(filtered);
    
    // Update trending restaurants (top 5 by weekly vote increase)
    const trending = [...filtered]
      .sort((a, b) => (b.weeklyVoteIncrease || 0) - (a.weeklyVoteIncrease || 0))
      .slice(0, 5);
    setTrendingRestaurants(trending);
    
    // Save to localStorage
    localStorage.setItem('topbites-restaurants', JSON.stringify(restaurants));
  }, [restaurants, activeTagIds]);

  // Save user votes when they change
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      localStorage.setItem(`topbites-votes-${user.email}`, JSON.stringify(userVotes));
    }
  }, [userVotes, isAuthenticated, user]);

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
    if (!isAuthenticated || !user?.email) {
      toast({
        title: "Authentication required",
        description: "You need to log in to vote for restaurants",
        variant: "destructive",
      });
      return;
    }

    // Check if user has already voted for this restaurant
    const existingVote = userVotes[restaurantId];
    
    if (existingVote === voteType) {
      toast({
        title: "Already voted",
        description: `You have already ${voteType === 'up' ? 'upvoted' : 'downvoted'} this restaurant`,
        variant: "destructive",
      });
      return;
    }
    
    setRestaurants(prev => 
      prev.map(restaurant => {
        if (restaurant.id === restaurantId) {
          let voteChange = voteType === 'up' ? 1 : -1;
          
          // If changing vote, reverse previous vote first
          if (existingVote) {
            voteChange += existingVote === 'up' ? -1 : 1;
          }
          
          return {
            ...restaurant,
            voteCount: restaurant.voteCount + voteChange
          };
        }
        return restaurant;
      })
    );
    
    // Update user votes
    setUserVotes(prev => ({
      ...prev,
      [restaurantId]: voteType
    }));
    
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
