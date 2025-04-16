
export type TagCategory = 'area' | 'cuisine' | 'awards' | 'dietary';

export interface Tag {
  id: string;
  name: string;
  category: TagCategory;
}

export const tags: Tag[] = [
  // Areas
  { id: 'clerkenwell', name: 'Clerkenwell', category: 'area' },
  { id: 'shoreditch', name: 'Shoreditch', category: 'area' },
  { id: 'soho', name: 'Soho', category: 'area' },
  { id: 'covent-garden', name: 'Covent Garden', category: 'area' },
  { id: 'mayfair', name: 'Mayfair', category: 'area' },
  { id: 'hackney', name: 'Hackney', category: 'area' },
  { id: 'islington', name: 'Islington', category: 'area' },
  { id: 'brixton', name: 'Brixton', category: 'area' },
  
  // Cuisines
  { id: 'italian', name: 'Italian', category: 'cuisine' },
  { id: 'vietnamese', name: 'Vietnamese', category: 'cuisine' },
  { id: 'japanese', name: 'Japanese', category: 'cuisine' },
  { id: 'indian', name: 'Indian', category: 'cuisine' },
  { id: 'british', name: 'British', category: 'cuisine' },
  { id: 'french', name: 'French', category: 'cuisine' },
  { id: 'spanish', name: 'Spanish', category: 'cuisine' },
  { id: 'mexican', name: 'Mexican', category: 'cuisine' },
  { id: 'thai', name: 'Thai', category: 'cuisine' },
  
  // Awards
  { id: 'michelin-star', name: 'Michelin Star', category: 'awards' },
  { id: 'bib-gourmand', name: 'Bib Gourmand', category: 'awards' },
  { id: 'time-out', name: 'Time Out Award', category: 'awards' },
  
  // Dietary
  { id: 'vegetarian', name: 'Vegetarian', category: 'dietary' },
  { id: 'vegan', name: 'Vegan', category: 'dietary' },
  { id: 'gluten-free', name: 'Gluten Free', category: 'dietary' },
];

export const tagCategories = [
  { id: 'area', name: 'Area' },
  { id: 'cuisine', name: 'Cuisine' },
  { id: 'awards', name: 'Awards' },
  { id: 'dietary', name: 'Dietary' },
];
