import { useState, useEffect } from 'react';
import { Restaurant } from '@/data/restaurants';
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/hooks/use-toast";

export const useRestaurantVotes = (initialRestaurants: Restaurant[]) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants);
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({});
  const { isAuthenticated, user, isAdmin } = useAuth();
  const { toast } = useToast();

  // Initialize restaurants - prioritize initial data over localStorage to ensure consistency
  useEffect(() => {
    console.log('Initializing with initialRestaurants:', initialRestaurants);
    
    // Start with the initial restaurants from the data file
    const updatedRestaurants = [...initialRestaurants];
    
    // Check if there are stored restaurants
    const storedRestaurants = localStorage.getItem('topbites-restaurants');
    if (storedRestaurants) {
      try {
        const parsedStored = JSON.parse(storedRestaurants);
        
        // Merge stored votes with initial data to preserve vote counts
        parsedStored.forEach((storedRestaurant: Restaurant) => {
          const existingIndex = updatedRestaurants.findIndex(r => r.id === storedRestaurant.id);
          if (existingIndex >= 0) {
            // Update existing restaurant's vote count and weekly increase
            updatedRestaurants[existingIndex] = {
              ...updatedRestaurants[existingIndex],
              voteCount: storedRestaurant.voteCount,
              weeklyVoteIncrease: storedRestaurant.weeklyVoteIncrease || 0
            };
          } else if (storedRestaurant.id !== '13') {
            // Add new restaurant if it's not the conflicting "Henry's Test" with ID 13
            updatedRestaurants.push(storedRestaurant);
          }
        });
      } catch (error) {
        console.error('Failed to parse stored restaurants:', error);
      }
    }
    
    // Update state and localStorage with merged data
    setRestaurants(updatedRestaurants);
    localStorage.setItem('topbites-restaurants', JSON.stringify(updatedRestaurants));
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

  // Save restaurants to localStorage whenever they change after initial load
  useEffect(() => {
    // Only update localStorage after initial load to prevent race conditions
    if (restaurants !== initialRestaurants) {
      localStorage.setItem('topbites-restaurants', JSON.stringify(restaurants));
    }
  }, [restaurants, initialRestaurants]);

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

  const addRestaurant = (restaurantData: Omit<Restaurant, 'id' | 'voteCount' | 'dateAdded' | 'status' | 'weeklyVoteIncrease'>) => {
    // Generate a URL-friendly ID from the restaurant name
    const id = restaurantData.name.toLowerCase().replace(/\s+/g, '-');
    
    const newRestaurant: Restaurant = {
      ...restaurantData,
      id,
      voteCount: 0,
      dateAdded: new Date().toISOString().split('T')[0],
      status: isAdmin ? 'approved' : 'pending',
      weeklyVoteIncrease: 0
    };

    setRestaurants(prev => [...prev, newRestaurant]);
    
    toast({
      title: isAdmin ? "Restaurant added" : "Restaurant submitted for review",
      description: isAdmin 
        ? `${restaurantData.name} has been added to the list` 
        : `${restaurantData.name} has been submitted and will be reviewed by an admin`,
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
