
import { useState, useEffect } from 'react';
import { Restaurant } from '@/data/restaurants';

export const useRestaurantFilters = (restaurants: Restaurant[], initialTagIds = '') => {
  const [activeTagIds, setActiveTagIds] = useState<string[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(restaurants);
  const [trendingRestaurants, setTrendingRestaurants] = useState<Restaurant[]>(restaurants.slice(0, 5));

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
  }, [restaurants, activeTagIds]);

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

  return {
    activeTagIds,
    filteredRestaurants,
    trendingRestaurants,
    toggleTagFilter,
    clearTagFilters
  };
};
