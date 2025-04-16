
import { useState, useEffect } from 'react';
import { Restaurant } from '@/data/restaurants';
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/hooks/use-toast";

export const useRestaurantVotes = (initialRestaurants: Restaurant[]) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants);
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  // Initialize restaurants from localStorage or use initial data
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

  // Load user votes from localStorage
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

  // Save restaurants to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('topbites-restaurants', JSON.stringify(restaurants));
  }, [restaurants]);

  // Save user votes to localStorage whenever they change
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
    
    // Update restaurants with the new vote count
    setRestaurants(prevRestaurants => {
      return prevRestaurants.map(restaurant => {
        if (restaurant.id === restaurantId) {
          const currentVote = userVotes[restaurantId];
          let newVoteCount = restaurant.voteCount;
          
          // If user is clicking the same vote type they already selected, remove the vote
          if (currentVote === voteType) {
            newVoteCount = voteType === 'up' ? newVoteCount - 1 : newVoteCount + 1;
            
            // Remove the user's vote
            const updatedVotes = { ...userVotes };
            delete updatedVotes[restaurantId];
            setUserVotes(updatedVotes);
            
            toast({
              title: "Vote removed",
              description: `Your vote has been removed`,
            });
          } 
          // If user is changing their vote from one type to another
          else if (currentVote) {
            // Change from down to up: +2 (remove down, add up)
            // Change from up to down: -2 (remove up, add down)
            newVoteCount = voteType === 'up' ? newVoteCount + 2 : newVoteCount - 2;
            
            // Update the user's vote
            setUserVotes({
              ...userVotes,
              [restaurantId]: voteType
            });
            
            toast({
              title: voteType === 'up' ? "Upvoted!" : "Downvoted!",
              description: `You have ${voteType === 'up' ? 'upvoted' : 'downvoted'} this restaurant`,
            });
          } 
          // If user is voting for the first time
          else {
            newVoteCount = voteType === 'up' ? newVoteCount + 1 : newVoteCount - 1;
            
            // Add the user's vote
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

  return {
    restaurants,
    userVotes,
    voteForRestaurant,
    addRestaurant,
    getRestaurantById: (id: string) => restaurants.find(restaurant => restaurant.id === id)
  };
};
