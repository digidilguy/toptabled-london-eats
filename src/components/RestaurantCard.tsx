
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
              className="px-2 py-1 text-sm rounded-full bg-secondary text-secondary-foreground"
            >
              {tag.name}
            </span>
          ))}
        </div>

        <a 
          href={googleMapsLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <span>View on Maps</span>
          <ExternalLink size={16} />
        </a>
      </CardContent>

      <CardFooter className="border-t pt-4 flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleVote('up')}
          className={`${
            userVote === 'up' ? 'bg-green-100 border-green-500' : ''
          } text-green-600 hover:bg-green-100 hover:text-green-700 hover:border-green-500`}
        >
          <ThumbsUp className={userVote === 'up' ? 'fill-green-500' : ''} size={18} />
        </Button>

        <span className="font-semibold text-lg mx-4">
          {voteCount}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleVote('down')}
          className={`${
            userVote === 'down' ? 'bg-red-100 border-red-500' : ''
          } text-red-600 hover:bg-red-100 hover:text-red-700 hover:border-red-500`}
        >
          <ThumbsDown className={userVote === 'down' ? 'fill-red-500' : ''} size={18} />
        </Button>
      </CardFooter>

      <AuthDialog 
        isOpen={isAuthDialogOpen} 
        onClose={() => setIsAuthDialogOpen(false)} 
      />
    </Card>
  );
};

export default RestaurantCard;
