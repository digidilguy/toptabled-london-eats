
export interface Tag {
  id: string;
  name: string;
  icon?: string;
  category: TagCategory;
}

export type TagCategory = 'area' | 'cuisine' | 'awards' | 'dietary';

export interface TagCategoryDefinition {
  id: TagCategory;
  name: string;
}

// Define tag categories
export const tagCategories: TagCategoryDefinition[] = [
  { id: 'area', name: 'Area' },
  { id: 'cuisine', name: 'Cuisine' },
  { id: 'awards', name: 'Awards' },
  { id: 'dietary', name: 'Dietary' }
];

// Define available tags
export const tags: Tag[] = [
  { id: 'indian', name: 'Indian', category: 'cuisine' },
  { id: 'casual', name: 'Casual Dining', category: 'awards' },
  { id: 'italian', name: 'Italian', category: 'cuisine' },
  { id: 'pasta', name: 'Pasta', category: 'cuisine' },
  { id: 'taiwanese', name: 'Taiwanese', category: 'cuisine' },
  { id: 'spanish', name: 'Spanish', category: 'cuisine' },
  { id: 'tapas', name: 'Tapas', category: 'cuisine' },
  { id: 'trendy', name: 'Trendy', category: 'awards' },
  { id: 'vegetarian', name: 'Vegetarian', category: 'dietary' },
  { id: 'upscale', name: 'Upscale', category: 'awards' },
  { id: 'bbq', name: 'BBQ', category: 'cuisine' },
  { id: 'sri-lankan', name: 'Sri Lankan', category: 'cuisine' },
  { id: 'fine-dining', name: 'Fine Dining', category: 'awards' },
  { id: 'street-food', name: 'Street Food', category: 'awards' },
  { id: 'japanese', name: 'Japanese', category: 'cuisine' },
  { id: 'sushi', name: 'Sushi', category: 'cuisine' },
  { id: 'chinese', name: 'Chinese', category: 'cuisine' },
  { id: 'mexican', name: 'Mexican', category: 'cuisine' },
  { id: 'vegan', name: 'Vegan', category: 'dietary' },
  { id: 'soho', name: 'Soho', category: 'area' },
  { id: 'shoreditch', name: 'Shoreditch', category: 'area' },
  { id: 'city', name: 'City', category: 'area' },
  { id: 'south-bank', name: 'South Bank', category: 'area' }
];
