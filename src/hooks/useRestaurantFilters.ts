import { useState, useEffect } from 'react';
import { Restaurant, TagCategory } from '@/types/restaurant';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export const useRestaurantFilters = (restaurants: Restaurant[]) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTagIds, setActiveTagIds] = useState<string[]>([]);
  const [activeTagsByCategory, setActiveTagsByCategory] = useState<Record<TagCategory, string[]>>({
    area: [],
    cuisine: [],
    awards: [],
    dietary: []
  });
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>(restaurants);
  const [trendingRestaurants, setTrendingRestaurants] = useState<Restaurant[]>(restaurants.slice(0, 5));
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const { isAdmin } = useAuth();

  useEffect(() => {
    console.log('Current restaurants:', restaurants);
    console.log('isAdmin:', isAdmin);
    
    // Apply filter for approved restaurants or include pending if admin
    let visibleRestaurants = restaurants.map(r => ({
      ...r,
      status: r.status || 'approved'
    }));
    
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

    // Group active tags by category
    const tagsByCategory: Record<TagCategory, string[]> = {
      area: [],
      cuisine: [],
      awards: [],
      dietary: []
    };
    
    // Organize active tags by category
    activeTagIds.forEach(tagId => {
      for (const restaurant of visibleRestaurants) {
        if (restaurant.area_tag === tagId) {
          tagsByCategory.area.push(tagId);
          break;
        } 
        if (restaurant.cuisine_tag === tagId) {
          tagsByCategory.cuisine.push(tagId);
          break;
        }
        if (restaurant.awards_tag === tagId) {
          tagsByCategory.awards.push(tagId);
          break;
        }
        if (restaurant.dietary_tag === tagId) {
          tagsByCategory.dietary.push(tagId);
          break;
        }
      }
    });
    
    setActiveTagsByCategory(tagsByCategory);
    
    // Apply filters only to the main restaurant list
    if (activeTagIds.length > 0) {
      visibleRestaurants = visibleRestaurants.filter(restaurant => {
        return Object.entries(tagsByCategory).every(([category, categoryTags]) => {
          if (categoryTags.length === 0) return true;
          
          switch (category) {
            case 'area':
              return categoryTags.includes(restaurant.area_tag || '');
            case 'cuisine':
              return categoryTags.includes(restaurant.cuisine_tag || '');
            case 'awards':
              return categoryTags.includes(restaurant.awards_tag || '');
            case 'dietary':
              return categoryTags.includes(restaurant.dietary_tag || '');
            default:
              return true;
          }
        });
      });

      setSearchParams({ tags: activeTagIds.join(',') });
    } else {
      if (searchParams.has('tags')) {
        setSearchParams({});
      }
    }
    
    // Sort by vote count
    visibleRestaurants.sort((a, b) => b.voteCount - a.voteCount);
    setFilteredRestaurants(visibleRestaurants);
    
    // Get trending restaurants from the ORIGINAL restaurant list, not the filtered one
    const trending = restaurants
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
    activeTagsByCategory,
    filteredRestaurants,
    trendingRestaurants,
    toggleTagFilter,
    clearTagFilters,
    availableTags
  };
};
