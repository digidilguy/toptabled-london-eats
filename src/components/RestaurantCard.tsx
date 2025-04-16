
import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, MapPin, ExternalLink } from 'lucide-react';
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
  imageUrl: string;
}

const RestaurantCard = ({
  id,
  name,
  tagIds,
  googleMapsLink,
  voteCount,
  imageUrl
}: RestaurantCardProps) => {
  const { voteForRestaurant, toggleTagFilter } = useRestaurants();
  const { isAuthenticated } = useAuth();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [voteAnimation, setVoteAnimation] = useState<'none' | 'up' | 'down'>('none');

  const handleVote = (voteType: 'up' | 'down') => {
    if (!isAuthenticated) {
      setIsAuthDialogOpen(true);
      return;
    }

    voteForRestaurant(id, voteType);
    setVoteAnimation(voteType);
    setTimeout(() => setVoteAnimation('none'), 300);
  };

  // Get tag names from ids
  const restaurantTags = tagIds.map(tagId => {
    return tags.find(tag => tag.id === tagId);
  }).filter(Boolean);

  return (
    <Card className="restaurant-card overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-full object-cover"
        />
      </div>
      
      <CardContent className="pt-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-lg">{name}</h3>
          <a 
            href={googleMapsLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-neutral hover:text-accent transition-colors"
          >
            <MapPin size={18} />
          </a>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {restaurantTags.map(tag => tag && (
            <span 
              key={tag.id}
              className="tag"
              onClick={() => toggleTagFilter(tag.id)}
            >
              {tag.name}
            </span>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center border-t pt-3">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon"
            className={`${voteAnimation === 'up' ? 'animate-vote-pulse text-upvote' : ''}`}
            onClick={() => handleVote('up')}
          >
            <ThumbsUp size={18} />
          </Button>
          
          <span className={`font-medium ${voteCount > 0 ? 'text-upvote' : voteCount < 0 ? 'text-downvote' : 'text-neutral'}`}>
            {voteCount}
          </span>
          
          <Button 
            variant="ghost" 
            size="icon"
            className={`${voteAnimation === 'down' ? 'animate-vote-pulse text-downvote' : ''}`}
            onClick={() => handleVote('down')}
          >
            <ThumbsDown size={18} />
          </Button>
        </div>
        
        <a 
          href={googleMapsLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-accent hover:underline flex items-center gap-1"
        >
          <span>View on Maps</span>
          <ExternalLink size={12} />
        </a>
      </CardFooter>
      
      <AuthDialog 
        isOpen={isAuthDialogOpen} 
        onClose={() => setIsAuthDialogOpen(false)} 
      />
    </Card>
  );
};

export default RestaurantCard;
