
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRestaurants } from "@/context/RestaurantContext";
import { TrendingUp } from "lucide-react";
import { tags } from "@/data/tags";

const TrendingLeaderboard = () => {
  const { trendingRestaurants, toggleTagFilter } = useRestaurants();
  
  // Get tag names for a restaurant
  const getTagNames = (tagIds: string[], limit = 2) => {
    return tagIds
      .slice(0, limit)
      .map(id => {
        const tag = tags.find(t => t.id === id);
        return tag ? tag.name : '';
      })
      .filter(Boolean);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center">
          <span className="mr-2">Trending This Week</span>
          <TrendingUp size={18} className="text-upvote" />
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
                    +{restaurant.weeklyVoteIncrease}
                  </span>
                </div>
                <div className="flex gap-1 mt-1">
                  {getTagNames(restaurant.tagIds).map((tag, i) => (
                    <span 
                      key={i} 
                      className="text-xs text-neutral hover:text-accent cursor-pointer"
                      onClick={() => toggleTagFilter(restaurant.tagIds[i])}
                    >
                      {tag}{i < getTagNames(restaurant.tagIds).length - 1 ? ',' : ''}
                    </span>
                  ))}
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
