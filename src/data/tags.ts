
export interface Tag {
  id: string;
  name: string;
  icon?: string;
}

// Define available tags
export const tags: Tag[] = [
  { id: 'indian', name: 'Indian' },
  { id: 'casual', name: 'Casual Dining' },
  { id: 'italian', name: 'Italian' },
  { id: 'pasta', name: 'Pasta' },
  { id: 'taiwanese', name: 'Taiwanese' },
  { id: 'spanish', name: 'Spanish' },
  { id: 'tapas', name: 'Tapas' },
  { id: 'trendy', name: 'Trendy' },
  { id: 'vegetarian', name: 'Vegetarian' },
  { id: 'upscale', name: 'Upscale' },
  { id: 'bbq', name: 'BBQ' },
  { id: 'sri-lankan', name: 'Sri Lankan' },
  { id: 'fine-dining', name: 'Fine Dining' },
  { id: 'street-food', name: 'Street Food' },
  { id: 'japanese', name: 'Japanese' },
  { id: 'sushi', name: 'Sushi' },
  { id: 'chinese', name: 'Chinese' },
  { id: 'mexican', name: 'Mexican' },
  { id: 'vegan', name: 'Vegan' }
];
