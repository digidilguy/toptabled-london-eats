
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
    <Card className="mb-6 border border-accent/10 shadow-sm bg-card">
      <CardHeader className="pb-3 bg-card rounded-t-2xl">
        <CardTitle className="text-lg font-bold flex items-center text-white">
          <span className="mr-2">Trending This Week</span>
          <TrendingUp size={18} className="text-green" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {trendingRestaurants.map((restaurant, index) => (
            <li key={restaurant.id} className="flex items-center gap-3">
              <span className="font-bold text-lg text-green w-6">{index + 1}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">{restaurant.name}</span>
                  <span className="text-sm font-medium flex items-center gap-1 text-green">
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
                    className="flex items-center gap-1 text-xs text-white/70 hover:text-white transition-colors"
                  >
                    <MapPin size={14} className="text-white" />
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

