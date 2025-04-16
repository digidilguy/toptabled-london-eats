
import { useState, useEffect } from 'react';
import { Restaurant } from '@/data/restaurants';
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/hooks/use-toast";

export const useRestaurantVotes = (initialRestaurants: Restaurant[]) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants);
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const storedRestaurants = localStorage.getItem('topbites-restaurants');
    if (storedRestaurants) {
      try {
        setRestaurants(JSON.parse(storedRestaurants));
      } catch (error) {
        console.error('Failed to parse stored restaurants:', error);
        setRestaurants(initialRestaurants);
      }
    } else {
      localStorage.setItem('topbites-restaurants', JSON.stringify(initialRestaurants));
    }
  }, [initialRestaurants]);

  useEffect(() => {
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
  }, [isAuthenticated, user]);

  useEffect(() => {
    localStorage.setItem('topbites-restaurants', JSON.stringify(restaurants));
  }, [restaurants]);

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      localStorage.setItem(`topbites-votes-${user.email}`, JSON.stringify(userVotes));
    }
  }, [userVotes, isAuthenticated, user]);

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

  return {
    restaurants,
    userVotes,
    voteForRestaurant,
    addRestaurant: (restaurantData: Omit<Restaurant, 'id' | 'voteCount' | 'dateAdded'>) => {
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
    },
    getRestaurantById: (id: string) => restaurants.find(restaurant => restaurant.id === id)
  };
};
