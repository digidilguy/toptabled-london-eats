
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ThumbsUp } from 'lucide-react';
import { MapPin } from 'lucide-react';
import { useRestaurants } from '@/context/RestaurantContext';
import { useAuth } from '@/context/AuthContext';
import { tags } from '@/data/tags';
import AuthDialog from './AuthDialog';

interface RestaurantCardProps {
  id: string;
  name: string;
  tagIds: string[];
  googleMapsLink: string;
  voteCount: number;
}

const RestaurantCard = ({
  id,
  name,
  tagIds,
  googleMapsLink,
  voteCount,
}: RestaurantCardProps) => {
  const { voteForRestaurant, userVotes } = useRestaurants();
  const { isAuthenticated } = useAuth();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = React.useState(false);

  const userVote = userVotes[id];

  const handleVote = () => {
    if (!isAuthenticated) {
      setIsAuthDialogOpen(true);
      return;
    }
    // Only handle upvotes in this simpler version
    voteForRestaurant(id, 'up');
  };

  const restaurantTags = tagIds
    .map(tagId => tags.find(tag => tag.id === tagId))
    .filter(Boolean);

  return (
    <Card className="w-full bg-white hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-medium">{name}</h3>
          <button 
            onClick={handleVote}
            className="flex items-center gap-1.5 cursor-pointer"
            aria-label="Upvote restaurant"
          >
            <ThumbsUp 
              size={18} 
              className={`text-green-500 ${userVote === 'up' ? 'fill-green-500' : ''}`} 
            />
            <span className="text-green-500 font-medium">{voteCount}</span>
          </button>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {restaurantTags.map(tag => tag && (
            <span 
              key={tag.id}
              className="text-sm px-3 py-1 bg-gray-100 rounded-md text-gray-600"
            >
              {tag.name}
            </span>
          ))}
          
          <a 
            href={googleMapsLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors ml-auto"
          >
            <MapPin size={16} />
            <span>View on Maps</span>
          </a>
        </div>
      </CardContent>

      <AuthDialog 
        isOpen={isAuthDialogOpen} 
        onClose={() => setIsAuthDialogOpen(false)} 
      />
    </Card>
  );
};

export default RestaurantCard;
