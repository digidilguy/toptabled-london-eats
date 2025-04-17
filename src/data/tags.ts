
import { Tag, TagCategory, TagCategoryDefinition } from '@/types/restaurant';

// Define tag categories
export const tagCategories: TagCategoryDefinition[] = [
  { id: 'area', name: 'Area' },
  { id: 'cuisine', name: 'Cuisine' },
  { id: 'awards', name: 'Awards' },
  { id: 'dietary', name: 'Dietary' }
];

// Define available tags
export const tags: Tag[] = [
  // Area tags
  { id: 'soho', name: 'Soho', category: 'area' },
  { id: 'shoreditch', name: 'Shoreditch', category: 'area' },
  { id: 'city', name: 'City', category: 'area' },
  
  // Cuisine tags
  { id: 'indian', name: 'Indian', category: 'cuisine' },
  { id: 'italian', name: 'Italian', category: 'cuisine' },
  { id: 'taiwanese', name: 'Taiwanese', category: 'cuisine' },
  
  // Awards tags
  { id: 'bib-gourmand', name: 'Bib Gourmand', category: 'awards' },
  { id: 'michelin-1-star', name: 'Michelin 1 Star', category: 'awards' },
  { id: 'michelin-2-star', name: 'Michelin 2 Star', category: 'awards' },
  
  // Dietary tags
  { id: 'vegetarian', name: 'Vegetarian', category: 'dietary' },
  { id: 'vegan', name: 'Vegan', category: 'dietary' }
];
