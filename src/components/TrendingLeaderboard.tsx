
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRestaurants } from "@/context/RestaurantContext";
import { TrendingUp, MapPin } from "lucide-react";

const TrendingLeaderboard = () => {
  const { trendingRestaurants } = useRestaurants();
  
  // Get all available tags for a restaurant
  const getTagNames = (restaurant) => {
    const tags = [];
    
    if (restaurant.area_tag) tags.push({
      type: 'area',
      value: restaurant.area_tag
    });
    
    if (restaurant.cuisine_tag) tags.push({
      type: 'cuisine',
      value: restaurant.cuisine_tag
    });
    
    if (restaurant.awards_tag) tags.push({
      type: 'awards',
      value: restaurant.awards_tag
    });
    
    if (restaurant.dietary_tag) tags.push({
      type: 'dietary',
      value: restaurant.dietary_tag
    });
    
    return tags.map(tag => ({
      ...tag,
      displayName: tag.value.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    }));
  };

  return (
    <Card className="mb-6 border border-border shadow-sm bg-card">
      <CardHeader className="pb-3 bg-card rounded-t-2xl">
        <CardTitle className="text-lg font-bold flex items-center text-green-500">
          <span className="mr-2">Trending This Week</span>
          <TrendingUp size={18} className="text-green-500" />
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-card">
        <ul className="space-y-3">
          {trendingRestaurants.map((restaurant, index) => (
            <li key={restaurant.id} className="flex items-center gap-3">
              <span className="font-bold text-lg text-foreground w-6">{index + 1}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-medium text-foreground">{restaurant.name}</span>
                  <span className="text-sm font-medium flex items-center gap-1 text-green-500">
                    <TrendingUp size={14} className="text-green-500" />
                    +{restaurant.weeklyVoteIncrease || 0}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-y-1 mt-1">
                  <div className="flex flex-wrap gap-1 w-full">
                    {getTagNames(restaurant).map((tag, i) => (
                      <span 
                        key={`${tag.type}-${i}`} 
                        className="text-xs px-2 py-0.5 rounded-full bg-secondary text-foreground/90"
                      >
                        {tag.displayName}
                      </span>
                    ))}
                  </div>
                  <a 
                    href={restaurant.googleMapsLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-foreground/80 hover:text-foreground transition-colors mt-1"
                  >
                    <MapPin size={14} className="text-inherit" />
                    <span>View on Maps</span>
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default TrendingLeaderboard;
