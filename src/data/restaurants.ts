
import { Tag } from './tags';

export interface Restaurant {
  id: string;
  name: string;
  tagIds: string[];
  googleMapsLink: string;
  voteCount: number;
  dateAdded: string;
  imageUrl: string;
  weeklyVoteIncrease?: number;
  status: 'pending' | 'approved' | 'rejected';
}

// Define the restaurants array
const initialRestaurants: Restaurant[] = [
  // Note: The initial data is only used when the database is empty
  // The actual data will be loaded from Supabase
];

// Export the restaurants with all properties preserved
export const restaurants: Restaurant[] = initialRestaurants;

export const getTrendingRestaurants = (allRestaurants: Restaurant[], limit = 5) => {
  return [...allRestaurants]
    .filter(r => r.status === 'approved')
    .sort((a, b) => (b.weeklyVoteIncrease || 0) - (a.weeklyVoteIncrease || 0))
    .slice(0, limit);
};
