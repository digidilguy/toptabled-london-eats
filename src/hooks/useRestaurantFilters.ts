
import { useState, useEffect } from 'react';
import { Restaurant } from '@/data/restaurants';
import { useSearchParams, useNavigate } from 'react-router-dom';

export const useRestaurantFilters = (restaurants: Restaurant[]) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTagIds, setActiveTagIds] = useState<string[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(restaurants);
  const [trendingRestaurants, setTrendingRestaurants] = useState<Restaurant[]>(restaurants.slice(0, 5));

  // Initialize from URL params
  useEffect(() => {
    const tagsParam = searchParams.get('tags');
    if (tagsParam) {
      const tagIds = tagsParam.split(',');
      setActiveTagIds(tagIds);
    }
  }, []);

  useEffect(() => {
    let filtered = [...restaurants];
    
    if (activeTagIds.length > 0) {
      filtered = filtered.filter(restaurant => 
        activeTagIds.every(tagId => restaurant.tagIds.includes(tagId))
      );
      // Update URL when filters change
      setSearchParams({ tags: activeTagIds.join(',') });
    } else {
      // Clear URL params when no filters
      setSearchParams({});
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
    setSearchParams({});
  };

  return {
    activeTagIds,
    filteredRestaurants,
    trendingRestaurants,
    toggleTagFilter,
    clearTagFilters
  };
};
