
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRestaurants } from "@/context/RestaurantContext";
import { TrendingUp, MapPin } from "lucide-react";

const TrendingLeaderboard = () => {
  const { trendingRestaurants } = useRestaurants();
  
  // Get tag names for a restaurant
  const getTagNames = (restaurant, limit = 2) => {
    const restaurantTags = [];
    if (restaurant.area_tag) restaurantTags.push(restaurant.area_tag);
    if (restaurant.cuisine_tag) restaurantTags.push(restaurant.cuisine_tag);
    if (restaurant.awards_tag) restaurantTags.push(restaurant.awards_tag);
    if (restaurant.dietary_tag) restaurantTags.push(restaurant.dietary_tag);
    
    return restaurantTags
      .slice(0, limit)
      .map(tagId => tagId.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '));
  };

  return (
    <Card className="mb-6 border border-secondary shadow-sm">
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-secondary/30">
        <CardTitle className="text-lg font-bold flex items-center">
          <span className="mr-2">Trending This Week</span>
          <TrendingUp size={18} className="text-primary" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {trendingRestaurants.map((restaurant, index) => (
            <li key={restaurant.id} className="flex items-center gap-3">
              <span className="font-bold text-lg text-primary w-6">{index + 1}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{restaurant.name}</span>
                  <span className="text-sm text-upvote font-medium flex items-center gap-1">
                    <TrendingUp size={14} />
                    +{restaurant.weeklyVoteIncrease || 0}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <div className="flex gap-1">
                    {getTagNames(restaurant).map((tag, i) => (
                      <span 
                        key={i} 
                        className="text-xs text-neutral-foreground/80"
                      >
                        {tag}{i < getTagNames(restaurant).length - 1 ? ',' : ''}
                      </span>
                    ))}
                  </div>
                  <a 
                    href={restaurant.googleMapsLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-accent hover:text-accent/80 transition-colors"
                  >
                    <MapPin size={14} />
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
