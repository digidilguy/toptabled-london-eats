
// Remove the conflicting import and only use the local interface
// We'll export this interface for use elsewhere

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

// Define the restaurants array
const initialRestaurants: Restaurant[] = [
  {
    id: "67e55044-10b1-426f-9247-bb680e5fe0c8",
    name: "Dishoom",
    googleMapsLink: "https://goo.gl/maps/8PCgQJ6zAhE2JmU16",
    voteCount: 42,
    dateAdded: "2023-09-15",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop",
    weeklyVoteIncrease: 12,
    status: "approved",
    cuisine_tag: "indian",
    awards_tag: "casual"
  },
  {
    id: "d672e841-96f3-4651-a916-2a79a25cfc40",
    name: "Padella",
    googleMapsLink: "https://goo.gl/maps/SVoYJgtYyZTvD3x97",
    voteCount: 38,
    dateAdded: "2023-10-02",
    imageUrl: "https://images.unsplash.com/photo-1579684947550-22e945225d9a?w=800&auto=format&fit=crop",
    weeklyVoteIncrease: 8,
    status: "approved",
    cuisine_tag: "italian"
  },
  {
    id: "9c91f2a3-3b0f-462b-962c-83f8d9ba245a",
    name: "Bao",
    googleMapsLink: "https://goo.gl/maps/JGgGAjZkF4ZM9uV76",
    voteCount: 35,
    dateAdded: "2023-08-20",
    imageUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&auto=format&fit=crop",
    weeklyVoteIncrease: 5,
    status: "approved",
    cuisine_tag: "taiwanese",
    awards_tag: "casual"
  },
  {
    id: "fb32bb19-7e23-4a0a-9f6e-4e17ef7f1a57",
    name: "Barrafina",
    googleMapsLink: "https://goo.gl/maps/xqybMrz7Pekh8CmK9",
    voteCount: 29,
    dateAdded: "2023-11-05",
    imageUrl: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&auto=format&fit=crop",
    weeklyVoteIncrease: 7,
    status: "approved",
    cuisine_tag: "spanish"
  },
  {
    id: "f3cb2cdc-0a30-4340-85c6-5dc2efa6da36",
    name: "Gloria",
    googleMapsLink: "https://goo.gl/maps/Z3H92Q5ADqrgxWQb6",
    voteCount: 25,
    dateAdded: "2023-12-01",
    imageUrl: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800&auto=format&fit=crop",
    weeklyVoteIncrease: 10,
    status: "approved",
    cuisine_tag: "italian",
    awards_tag: "trendy"
  },
  {
    id: "3b7cc939-068f-4733-a5c2-5e9a5d53341f",
    name: "Rovi",
    googleMapsLink: "https://goo.gl/maps/vQu8LAPRuy7xJn8Q9",
    voteCount: 22,
    dateAdded: "2023-10-15",
    imageUrl: "https://images.unsplash.com/photo-1593001874117-08ea606f7e72?w=800&auto=format&fit=crop",
    weeklyVoteIncrease: 3,
    status: "approved",
    dietary_tag: "vegetarian",
    awards_tag: "upscale"
  },
  {
    id: "e9a33b4b-3c39-4785-93e2-5f35d72f9a31",
    name: "Smokestak",
    googleMapsLink: "https://goo.gl/maps/K2ZgBRHcepP6F7z68",
    voteCount: 19,
    dateAdded: "2023-11-22",
    imageUrl: "https://images.unsplash.com/photo-1470958023325-d170d8275456?w=800&auto=format&fit=crop",
    weeklyVoteIncrease: 4,
    status: "approved",
    cuisine_tag: "bbq",
    awards_tag: "casual"
  },
  {
    id: "a4b2c7e3-9f8d-4d7c-8a2b-1e5f6c9d8a3b",
    name: "Hoppers",
    googleMapsLink: "https://goo.gl/maps/XcffK7RnJm7CvJLd7",
    voteCount: 17,
    dateAdded: "2023-09-28",
    imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&auto=format&fit=crop",
    weeklyVoteIncrease: 2,
    status: "approved",
    cuisine_tag: "sri-lankan",
    awards_tag: "casual"
  }
];

// Export the restaurants with all properties preserved
export const restaurants: Restaurant[] = initialRestaurants;

export const getTrendingRestaurants = (allRestaurants: Restaurant[], limit = 5) => {
  return [...allRestaurants]
    .filter(r => r.status === 'approved')
    .sort((a, b) => (b.weeklyVoteIncrease || 0) - (a.weeklyVoteIncrease || 0))
    .slice(0, limit);
};
