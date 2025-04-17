
export interface Tag {
  id: string;
  name: string;
  icon?: string;
  category: TagCategory;
}

export type TagCategory = 'cuisine' | 'price' | 'vibes' | 'dietary';

export interface TagCategoryDefinition {
  id: TagCategory;
  name: string;
}

// Define tag categories
export const tagCategories: TagCategoryDefinition[] = [
  { id: 'cuisine', name: 'Cuisine' },
  { id: 'price', name: 'Price' },
  { id: 'vibes', name: 'Vibes' },
  { id: 'dietary', name: 'Dietary' }
];

// Define available tags
export const tags: Tag[] = [
  { id: 'indian', name: 'Indian', category: 'cuisine' },
  { id: 'casual', name: 'Casual Dining', category: 'vibes' },
  { id: 'italian', name: 'Italian', category: 'cuisine' },
  { id: 'pasta', name: 'Pasta', category: 'cuisine' },
  { id: 'taiwanese', name: 'Taiwanese', category: 'cuisine' },
  { id: 'spanish', name: 'Spanish', category: 'cuisine' },
  { id: 'tapas', name: 'Tapas', category: 'cuisine' },
  { id: 'trendy', name: 'Trendy', category: 'vibes' },
  { id: 'vegetarian', name: 'Vegetarian', category: 'dietary' },
  { id: 'upscale', name: 'Upscale', category: 'vibes' },
  { id: 'bbq', name: 'BBQ', category: 'cuisine' },
  { id: 'sri-lankan', name: 'Sri Lankan', category: 'cuisine' },
  { id: 'fine-dining', name: 'Fine Dining', category: 'vibes' },
  { id: 'street-food', name: 'Street Food', category: 'vibes' },
  { id: 'japanese', name: 'Japanese', category: 'cuisine' },
  { id: 'sushi', name: 'Sushi', category: 'cuisine' },
  { id: 'chinese', name: 'Chinese', category: 'cuisine' },
  { id: 'mexican', name: 'Mexican', category: 'cuisine' },
  { id: 'vegan', name: 'Vegan', category: 'dietary' },
  { id: 'cheap', name: '$', category: 'price' },
  { id: 'moderate', name: '$$', category: 'price' },
  { id: 'expensive', name: '$$$', category: 'price' },
  { id: 'very-expensive', name: '$$$$', category: 'price' }
];
