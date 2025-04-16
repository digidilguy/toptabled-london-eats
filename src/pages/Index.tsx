
import Navbar from "@/components/Navbar";
import TagFilter from "@/components/TagFilter";
import { AuthProvider } from "@/context/AuthContext";
import { RestaurantProvider, useRestaurants } from "@/context/RestaurantContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, ExternalLink, MapPin } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import AuthDialog from "@/components/AuthDialog";
import { tags } from "@/data/tags";
import { useLocation, useNavigate } from "react-router-dom";
import TrendingLeaderboard from "@/components/TrendingLeaderboard";

const RestaurantList = () => {
  const { filteredRestaurants, voteForRestaurant, activeTagIds, userVotes } = useRestaurants();
  const { isAuthenticated } = useAuth();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [votingRestaurantId, setVotingRestaurantId] = useState<string | null>(null);
  const [voteType, setVoteType] = useState<'up' | 'down'>('up');
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get tag names from ids
  const getTagNames = (tagIds: string[]) => {
    return tagIds.map(tagId => {
      const tag = tags.find(tag => tag.id === tagId);
      return tag ? tag.name : '';
    }).filter(Boolean).join(', ');
  };
  
  const handleVote = (restaurantId: string, type: 'up' | 'down') => {
    if (!isAuthenticated) {
      setVotingRestaurantId(restaurantId);
      setVoteType(type);
      setIsAuthDialogOpen(true);
      return;
    }
    
    voteForRestaurant(restaurantId, type);
  };
  
  // After successful auth, process the pending vote
  const handleAuthSuccess = () => {
    if (votingRestaurantId) {
      voteForRestaurant(votingRestaurantId, voteType);
      setVotingRestaurantId(null);
    }
    setIsAuthDialogOpen(false);
  };
  
  // Sync URL with active tag filters
  useEffect(() => {
    const searchParams = new URLSearchParams();
    
    if (activeTagIds.length > 0) {
      searchParams.set('tags', activeTagIds.join(','));
    }
    
    const newSearch = searchParams.toString();
    const currentSearch = location.search.replace('?', '');
    
    if (newSearch !== currentSearch) {
      navigate({ search: newSearch ? `?${newSearch}` : '' }, { replace: true });
    }
  }, [activeTagIds, navigate, location.search]);
  
  console.log("Filtered restaurants:", filteredRestaurants); // Debug log
  
  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Rank</TableHead>
            <TableHead>Restaurant</TableHead>
            <TableHead className="hidden md:table-cell">Tags</TableHead>
            <TableHead className="w-[150px]">Rating</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRestaurants && filteredRestaurants.length > 0 ? (
            filteredRestaurants.map((restaurant, index) => (
              <TableRow key={restaurant.id}>
                <TableCell className="font-bold text-lg">{index + 1}</TableCell>
                <TableCell>
                  <div className="font-medium">{restaurant.name}</div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-neutral">
                  {getTagNames(restaurant.tagIds)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-6">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className={`text-upvote hover:text-upvote/80 ${userVotes[restaurant.id] === 'up' ? 'bg-upvote/10' : ''}`}
                      onClick={() => handleVote(restaurant.id, 'up')}
                      disabled={userVotes[restaurant.id] === 'up'}
                    >
                      <ThumbsUp size={18} />
                    </Button>
                    
                    <span className={`font-medium ${restaurant.voteCount > 0 ? 'text-upvote' : restaurant.voteCount < 0 ? 'text-downvote' : 'text-neutral'}`}>
                      {restaurant.voteCount}
                    </span>
                    
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className={`text-downvote hover:text-downvote/80 ${userVotes[restaurant.id] === 'down' ? 'bg-downvote/10' : ''}`}
                      onClick={() => handleVote(restaurant.id, 'down')}
                      disabled={userVotes[restaurant.id] === 'down'}
                    >
                      <ThumbsDown size={18} />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <a 
                      href={restaurant.googleMapsLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-neutral/10 text-neutral hover:bg-neutral/20 transition-colors"
                      title="View on Maps"
                    >
                      <MapPin size={16} />
                    </a>
                    <a 
                      href={restaurant.googleMapsLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                      title="Open External Link"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                <div className="py-6">
                  <h3 className="text-lg font-medium mb-2">No restaurants found</h3>
                  <p className="text-neutral">Try removing some filters or check back later for new additions!</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      <AuthDialog 
        isOpen={isAuthDialogOpen} 
        onClose={() => setIsAuthDialogOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

const IndexPage = () => {
  const location = useLocation();
  
  return (
    <AuthProvider>
      <RestaurantProvider initialTagIds={location.search}>
        <div className="min-h-screen bg-secondary">
          <Navbar />
          
          <div className="container mx-auto px-4 py-8">
            <header className="mb-8 text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">Top London Restaurants</h1>
              <p className="text-neutral max-w-2xl mx-auto">
                A curated list of the best restaurants in London, rated by locals and food lovers. 
                Upvote your favorites to help them climb the rankings!
              </p>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <TagFilter />
                <TrendingLeaderboard />
              </div>
              
              <div className="lg:col-span-3">
                <RestaurantList />
              </div>
            </div>
          </div>
          
          <footer className="mt-12 py-6 bg-white border-t">
            <div className="container mx-auto px-4 text-center text-sm text-neutral">
              <p>© 2025 TopBites – Discover London's best restaurants</p>
            </div>
          </footer>
        </div>
      </RestaurantProvider>
    </AuthProvider>
  );
};

export default IndexPage;
