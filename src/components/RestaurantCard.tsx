
import { MapPin, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "./ui/button";
import { Restaurant } from "@/types/restaurant";
import { useRestaurantVoting } from "@/hooks/useRestaurantVoting";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const RestaurantCard = ({ restaurant }: RestaurantCardProps) => {
  const { handleVote, userVotes } = useRestaurantVoting();

  const getTagDisplayName = (tagId: string) => {
    return tagId
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getRestaurantTags = () => {
    const restaurantTags = [];
    if (restaurant.area_tag) restaurantTags.push(restaurant.area_tag);
    if (restaurant.cuisine_tag) restaurantTags.push(restaurant.cuisine_tag);
    if (restaurant.awards_tag) restaurantTags.push(restaurant.awards_tag);
    if (restaurant.dietary_tag) restaurantTags.push(restaurant.dietary_tag);
    return restaurantTags;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-border bg-card/80 shadow-[0_4px_14px_-4px_rgba(0,0,0,0.4)] transition-shadow hover:shadow-xl">
      <div className="flex-1 space-y-3 sm:space-y-2">
        <div className="flex items-center justify-between">
          {/* Restaurant Name */}
          <h3 className="font-serif text-lg text-white">{restaurant.name}</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleVote(restaurant.id, "up")}
              className={
                userVotes[restaurant.id] === "up"
                  ? "text-upvote animate-vote-pulse"
                  : "text-muted-foreground hover:text-upvote/80"
              }
            >
              <ThumbsUp
                size={16}
                className={userVotes[restaurant.id] === "up" ? "fill-current" : ""}
              />
            </Button>
            <span className="text-sm font-medium text-card-foreground">{restaurant.voteCount}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleVote(restaurant.id, "down")}
              className={
                userVotes[restaurant.id] === "down"
                  ? "text-downvote animate-vote-pulse"
                  : "text-muted-foreground hover:text-downvote/80"
              }
            >
              <ThumbsDown
                size={16}
                className={userVotes[restaurant.id] === "down" ? "fill-current" : ""}
              />
            </Button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex flex-wrap gap-1">
            {getRestaurantTags().map((tagId) => (
              <span
                key={tagId}
                className="text-xs px-2 py-0.5 bg-secondary/60 rounded-full text-accent/90"
              >
                {getTagDisplayName(tagId)}
              </span>
            ))}
          </div>
          <a
            href={restaurant.googleMapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            <MapPin size={14} />
            <span>View on Maps</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;

