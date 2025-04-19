import React from 'react';

export type TagCategory = 'area' | 'cuisine' | 'awards' | 'dietary';

export interface TagCategoryDefinition {
  id: TagCategory;
  name: string;
}

export interface Tag {
  id: string;
  name: string;
  category: TagCategory;
}

export interface RestaurantContextType {
  restaurants: Restaurant[];
  trendingRestaurants: Restaurant[];
  filteredRestaurants: Restaurant[];
  activeTagIds: string[];
  activeTagsByCategory: Record<TagCategory, string[]>;
  availableTags: string[];
  toggleTagFilter: (tagId: string) => void;
  clearTagFilters: () => void;
  voteForRestaurant: (restaurantId: string, voteType: 'up' | 'down') => Promise<{
    action: 'removed' | 'voted';
    type: 'up' | 'down';
  }>;
  addRestaurant: (restaurant: Omit<Restaurant, 'id' | 'voteCount' | 'dateAdded' | 'status' | 'weeklyVoteIncrease'>) => void;
  getRestaurantById: (id: string) => Restaurant | undefined;
  userVotes: Record<string, 'up' | 'down'>;
}

export interface RestaurantProviderProps {
  children: React.ReactNode;
  initialTagIds?: string; // This is no longer used but keeping for backwards compatibility
}

// Restaurant interface that matches the one in restaurants.ts
export interface Restaurant {
  id: string;
  name: string;
  googleMapsLink: string;
  voteCount: number;
  dateAdded: string;
  imageUrl: string;
  weeklyVoteIncrease?: number;
  status: 'pending' | 'approved' | 'rejected';
  area_tag?: string;
  cuisine_tag?: string;
  awards_tag?: string;
  dietary_tag?: string;
}
