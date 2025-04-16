
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, ExternalLink } from 'lucide-react';
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

  const handleVote = (voteType: 'up' | 'down') => {
    if (!isAuthenticated) {
      setIsAuthDialogOpen(true);
      return;
    }
    voteForRestaurant(id, voteType);
  };

  const restaurantTags = tagIds
    .map(tagId => tags.find(tag => tag.id === tagId))
    .filter(Boolean);

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <h3 className="text-lg font-bold mb-3">{name}</h3>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {restaurantTags.map(tag => tag && (
            <span 
              key={tag.id}
              className="px-2 py-1 text-sm rounded-full bg-secondary text-accent"
            >
              {tag.name}
            </span>
          ))}
        </div>

        <a 
          href={googleMapsLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-accent hover:text-accent/70 transition-colors"
        >
          <span>View on Maps</span>
          <ExternalLink size={16} />
        </a>
      </CardContent>

      <CardFooter className="border-t pt-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleVote('up')}
            className={`${userVote === 'up' ? 'text-green-600 bg-green-50' : ''} hover:text-green-600 hover:bg-green-50`}
          >
            <ThumbsUp className={userVote === 'up' ? 'fill-current' : ''} />
          </Button>

          <span className="font-medium">
            {voteCount}
          </span>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleVote('down')}
            className={`${userVote === 'down' ? 'text-red-600 bg-red-50' : ''} hover:text-red-600 hover:bg-red-50`}
          >
            <ThumbsDown className={userVote === 'down' ? 'fill-current' : ''} />
          </Button>
        </div>
      </CardFooter>

      <AuthDialog 
        isOpen={isAuthDialogOpen} 
        onClose={() => setIsAuthDialogOpen(false)} 
      />
    </Card>
  );
};

export default RestaurantCard;
