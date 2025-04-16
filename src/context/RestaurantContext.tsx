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
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(initialRestaurants);
  const [trendingRestaurants, setTrendingRestaurants] = useState<Restaurant[]>(initialRestaurants.slice(0, 5));
  const [activeTagIds, setActiveTagIds] = useState<string[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (initialTagIds) {
      const tagsParam = new URLSearchParams(initialTagIds).get('tags');
      if (tagsParam) {
        const tagIds = tagsParam.split(',');
        setActiveTagIds(tagIds);
      }
    }
  }, [initialTagIds]);

  useEffect(() => {
    const storedRestaurants = localStorage.getItem('topbites-restaurants');
    if (storedRestaurants) {
      try {
        const parsedRestaurants = JSON.parse(storedRestaurants);
        setRestaurants(parsedRestaurants);
        
        let filtered = [...parsedRestaurants];
        if (activeTagIds.length > 0) {
          filtered = filtered.filter(restaurant => 
            activeTagIds.every(tagId => restaurant.tagIds.includes(tagId))
          );
        }
        filtered.sort((a, b) => b.voteCount - a.voteCount);
        setFilteredRestaurants(filtered);
        
        const trending = [...filtered].sort((a, b) => 
          (b.weeklyVoteIncrease || 0) - (a.weeklyVoteIncrease || 0)
        ).slice(0, 5);
        setTrendingRestaurants(trending);
      } catch (error) {
        console.error('Failed to parse stored restaurants:', error);
        setRestaurants(initialRestaurants);
      }
    } else {
      localStorage.setItem('topbites-restaurants', JSON.stringify(initialRestaurants));
    }
    
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

  useEffect(() => {
    let filtered = [...restaurants];
    
    if (activeTagIds.length > 0) {
      filtered = filtered.filter(restaurant => 
        activeTagIds.every(tagId => restaurant.tagIds.includes(tagId))
      );
    }
    
    filtered.sort((a, b) => b.voteCount - a.voteCount);
    
    setFilteredRestaurants(filtered);
    
    const trending = [...filtered]
      .sort((a, b) => (b.weeklyVoteIncrease || 0) - (a.weeklyVoteIncrease || 0))
      .slice(0, 5);
    setTrendingRestaurants(trending);
    
    localStorage.setItem('topbites-restaurants', JSON.stringify(restaurants));
  }, [restaurants, activeTagIds]);

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      localStorage.setItem(`topbites-votes-${user.email}`, JSON.stringify(userVotes));
    }
  }, [userVotes, isAuthenticated, user]);

  const toggleTagFilter = (tagId: string) => {
    setActiveTagIds(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const clearTagFilters = () => {
    setActiveTagIds([]);
  };

  const voteForRestaurant = (restaurantId: string, voteType: 'up' | 'down') => {
    if (!isAuthenticated || !user?.email) {
      toast({
        title: "Authentication required",
        description: "You need to log in to vote for restaurants",
        variant: "destructive",
      });
      return;
    }

    const existingVote = userVotes[restaurantId];
    
    setRestaurants(prev => 
      prev.map(restaurant => {
        if (restaurant.id === restaurantId) {
          let voteChange = 0;
          
          if (existingVote === voteType) {
            voteChange = voteType === 'up' ? -1 : 1;
            
            setTimeout(() => {
              const updatedVotes = { ...userVotes };
              delete updatedVotes[restaurantId];
              setUserVotes(updatedVotes);
              
              toast({
                title: "Vote removed",
                description: `Your vote has been removed`,
              });
            }, 0);
            
          } else {
            if (existingVote) {
              voteChange = voteType === 'up' ? 2 : -2;
            } else {
              voteChange = voteType === 'up' ? 1 : -1;
            }
            
            setTimeout(() => {
              setUserVotes(prev => ({
                ...prev,
                [restaurantId]: voteType
              }));
              
              toast({
                title: voteType === 'up' ? "Upvoted!" : "Downvoted!",
                description: `You have ${voteType === 'up' ? 'upvoted' : 'downvoted'} this restaurant`,
              });
            }, 0);
          }
          
          return {
            ...restaurant,
            voteCount: restaurant.voteCount + voteChange,
            weeklyVoteIncrease: (restaurant.weeklyVoteIncrease || 0) + (voteChange > 0 ? 1 : voteChange < 0 ? -1 : 0)
          };
        }
        return restaurant;
      })
    );
  };

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
