
import { useState, useEffect } from 'react';
import { Restaurant } from '@/data/restaurants';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const useRestaurantFilters = (restaurants: Restaurant[]) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTagIds, setActiveTagIds] = useState<string[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(restaurants);
  const [trendingRestaurants, setTrendingRestaurants] = useState<Restaurant[]>(restaurants.slice(0, 5));
  const { isAdmin } = useAuth();

  // Initialize from URL params
  useEffect(() => {
    const tagsParam = searchParams.get('tags');
    if (tagsParam) {
      const tagIds = tagsParam.split(',');
      setActiveTagIds(tagIds);
    }
  }, []);

  useEffect(() => {
    // Filter restaurants that are approved or, if admin, include pending ones
    let visibleRestaurants = isAdmin 
      ? [...restaurants]
      : restaurants.filter(r => r.status === 'approved');
    
    if (activeTagIds.length > 0) {
      visibleRestaurants = visibleRestaurants.filter(restaurant => 
        activeTagIds.every(tagId => restaurant.tagIds.includes(tagId))
      );
      // Update URL when filters change
      setSearchParams({ tags: activeTagIds.join(',') });
    } else {
      // Clear URL params when no filters
      setSearchParams({});
    }
    
    visibleRestaurants.sort((a, b) => b.voteCount - a.voteCount);
    setFilteredRestaurants(visibleRestaurants);
    
    // Filter trending to only show approved restaurants
    const trending = [...visibleRestaurants]
      .sort((a, b) => (b.weeklyVoteIncrease || 0) - (a.weeklyVoteIncrease || 0))
      .slice(0, 5);
    setTrendingRestaurants(trending);
  }, [restaurants, activeTagIds, isAdmin]);

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
