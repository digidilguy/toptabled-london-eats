
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
  const { voteForRestaurant, toggleTagFilter, userVotes } = useRestaurants();
  const { isAuthenticated } = useAuth();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [voteAnimation, setVoteAnimation] = useState<'none' | 'up' | 'down'>('none');

  // Get the user's vote for this restaurant
  const userVote = userVotes[id];

  const handleVote = (voteType: 'up' | 'down') => {
    if (!isAuthenticated) {
      setIsAuthDialogOpen(true);
      return;
    }

    // Check if user is trying to undo their vote
    if (userVote === voteType) {
      // Allow undoing a vote by voting again with the same type
      voteForRestaurant(id, voteType);
      setVoteAnimation('none');
    } else {
      // Normal voting flow
      voteForRestaurant(id, voteType);
      setVoteAnimation(voteType);
      setTimeout(() => setVoteAnimation('none'), 300);
    }
  };

  // Get tag names from ids
  const restaurantTags = tagIds.map(tagId => {
    return tags.find(tag => tag.id === tagId);
  }).filter(Boolean);

  return (
    <Card className="restaurant-card group overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <a 
          href={googleMapsLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="absolute top-3 right-3 bg-white/90 p-2 rounded-full text-neutral hover:text-accent transition-colors"
        >
          <MapPin size={18} />
        </a>
      </div>
      
      <CardContent className="relative pt-4">
        <h3 className="font-bold text-lg mb-3 line-clamp-1">{name}</h3>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {restaurantTags.map(tag => tag && (
            <span 
              key={tag.id}
              onClick={() => toggleTagFilter(tag.id)}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                bg-secondary text-accent hover:bg-accent hover:text-white transition-colors cursor-pointer"
            >
              {tag.name}
            </span>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center border-t pt-3 bg-secondary/50">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon"
            className={`
              ${voteAnimation === 'up' ? 'animate-vote-pulse' : ''} 
              ${userVote === 'up' ? 'text-upvote' : ''}
              hover:text-upvote
            `}
            onClick={() => handleVote('up')}
            aria-label="Upvote"
          >
            <ThumbsUp size={18} />
          </Button>
          
          <span className={`font-medium ${voteCount > 0 ? 'text-upvote' : voteCount < 0 ? 'text-downvote' : 'text-neutral'}`}>
            {voteCount}
          </span>
          
          <Button 
            variant="ghost" 
            size="icon"
            className={`
              ${voteAnimation === 'down' ? 'animate-vote-pulse' : ''}
              ${userVote === 'down' ? 'text-downvote' : ''}
              hover:text-downvote
            `}
            onClick={() => handleVote('down')}
            aria-label="Downvote"
          >
            <ThumbsDown size={18} />
          </Button>
        </div>
        
        <a 
          href={googleMapsLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-accent hover:text-accent/70 flex items-center gap-1 transition-colors"
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
