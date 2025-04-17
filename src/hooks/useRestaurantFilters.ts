
import { useState, useEffect } from 'react';
import { Restaurant } from '@/data/restaurants';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { tags } from '@/data/tags';

export const useRestaurantFilters = (restaurants: Restaurant[]) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTagIds, setActiveTagIds] = useState<string[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(restaurants);
  const [trendingRestaurants, setTrendingRestaurants] = useState<Restaurant[]>(restaurants.slice(0, 5));
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const { isAdmin } = useAuth();

  // Initialize from URL params
  useEffect(() => {
    const tagsParam = searchParams.get('tags');
    if (tagsParam) {
      const tagIds = tagsParam.split(',');
      setActiveTagIds(tagIds);
    }
  }, [searchParams]);

  useEffect(() => {
    // Debug information
    console.log('Current restaurants:', restaurants);
    console.log('isAdmin:', isAdmin);
    
    // Apply filter for approved restaurants or include pending if admin
    let visibleRestaurants = restaurants.map(r => ({
      ...r,
      status: r.status || 'approved' // Default to approved if status is missing
    }));
    
    // Filter restaurants that are approved or, if admin, include pending ones
    visibleRestaurants = isAdmin 
      ? [...visibleRestaurants]
      : visibleRestaurants.filter(r => r.status === 'approved');
    
    console.log('Visible restaurants after status filter:', visibleRestaurants);
    
    // Find all available tags from the current restaurant list
    const tagSet = new Set<string>();
    visibleRestaurants.forEach(restaurant => {
      if (restaurant.area_tag) tagSet.add(restaurant.area_tag);
      if (restaurant.cuisine_tag) tagSet.add(restaurant.cuisine_tag);
      if (restaurant.awards_tag) tagSet.add(restaurant.awards_tag);
      if (restaurant.dietary_tag) tagSet.add(restaurant.dietary_tag);
    });
    setAvailableTags(Array.from(tagSet));
    console.log('Available tags:', Array.from(tagSet));

    // Apply tag filters if any are active
    if (activeTagIds.length > 0) {
      visibleRestaurants = visibleRestaurants.filter(restaurant => 
        // Check if the restaurant has ANY of the active tags (OR filter)
        activeTagIds.some(tagId => 
          restaurant.area_tag === tagId ||
          restaurant.cuisine_tag === tagId ||
          restaurant.awards_tag === tagId ||
          restaurant.dietary_tag === tagId
        )
      );
      // Update URL when filters change
      setSearchParams({ tags: activeTagIds.join(',') });
    } else {
      // Clear URL params when no filters
      if (searchParams.has('tags')) {
        setSearchParams({});
      }
    }
    
    // Sort by vote count
    visibleRestaurants.sort((a, b) => b.voteCount - a.voteCount);
    setFilteredRestaurants(visibleRestaurants);
    
    // Filter trending to only show approved restaurants
    const trending = visibleRestaurants
      .filter(r => r.status === 'approved')
      .sort((a, b) => (b.weeklyVoteIncrease || 0) - (a.weeklyVoteIncrease || 0))
      .slice(0, 5);
    setTrendingRestaurants(trending);
  }, [restaurants, activeTagIds, isAdmin, searchParams]);

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
    clearTagFilters,
    availableTags
  };
};
