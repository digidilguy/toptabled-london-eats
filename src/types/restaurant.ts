import { Restaurant } from '@/data/restaurants';

export interface RestaurantContextType {
  restaurants: Restaurant[];
  trendingRestaurants: Restaurant[];
  filteredRestaurants: Restaurant[];
  activeTagIds: string[];
  availableTags: string[];
  toggleTagFilter: (tagId: string) => void;
  clearTagFilters: () => void;
  voteForRestaurant: (restaurantId: string, voteType: 'up' | 'down') => void;
  addRestaurant: (restaurant: Omit<Restaurant, 'id' | 'voteCount' | 'dateAdded' | 'status' | 'weeklyVoteIncrease'>) => void;
  getRestaurantById: (id: string) => Restaurant | undefined;
  userVotes: Record<string, 'up' | 'down'>;
}

export interface RestaurantProviderProps {
  children: React.ReactNode;
  initialTagIds?: string; // This is no longer used but keeping for backwards compatibility
}

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
