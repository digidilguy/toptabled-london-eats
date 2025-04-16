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

    console.log(`Voting ${voteType} for restaurant ${restaurantId}`);
    
    setRestaurants(prevRestaurants => {
      return prevRestaurants.map(restaurant => {
        if (restaurant.id === restaurantId) {
          const currentVote = userVotes[restaurantId];
          let newVoteCount = restaurant.voteCount;
          
          if (currentVote === voteType) {
            newVoteCount = voteType === 'up' ? newVoteCount - 1 : newVoteCount + 1;
            
            const updatedVotes = { ...userVotes };
            delete updatedVotes[restaurantId];
            setUserVotes(updatedVotes);
            
            toast({
              title: "Vote removed",
              description: `Your vote has been removed`,
            });
          } 
          else if (currentVote) {
            newVoteCount = voteType === 'up' ? newVoteCount + 2 : newVoteCount - 2;
            
            setUserVotes({
              ...userVotes,
              [restaurantId]: voteType
            });
            
            toast({
              title: voteType === 'up' ? "Upvoted!" : "Downvoted!",
              description: `You have ${voteType === 'up' ? 'upvoted' : 'downvoted'} this restaurant`,
            });
          } 
          else {
            newVoteCount = voteType === 'up' ? newVoteCount + 1 : newVoteCount - 1;
            
            setUserVotes({
              ...userVotes,
              [restaurantId]: voteType
            });
            
            toast({
              title: voteType === 'up' ? "Upvoted!" : "Downvoted!",
              description: `You have ${voteType === 'up' ? 'upvoted' : 'downvoted'} this restaurant`,
            });
          }
          
          return {
            ...restaurant,
            voteCount: newVoteCount,
            weeklyVoteIncrease: restaurant.weeklyVoteIncrease || 0
          };
        }
        return restaurant;
      });
    });
  };

  const addRestaurant = (restaurantData: Omit<Restaurant, 'id' | 'voteCount' | 'dateAdded' | 'status'>) => {
    const newRestaurant: Restaurant = {
      ...restaurantData,
      id: (restaurants.length + 1).toString(),
      voteCount: 0,
      dateAdded: new Date().toISOString().split('T')[0],
      status: 'pending'
    };

    setRestaurants(prev => [...prev, newRestaurant]);
    
    toast({
      title: "Restaurant submitted",
      description: "Your submission will be reviewed by our admins",
    });
  };

  return {
    restaurants,
    userVotes,
    voteForRestaurant,
    addRestaurant,
    getRestaurantById: (id: string) => restaurants.find(restaurant => restaurant.id === id)
  };
};
