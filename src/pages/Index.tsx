
import Navbar from "@/components/Navbar";
import RestaurantCard from "@/components/RestaurantCard";
import TagFilter from "@/components/TagFilter";
import TrendingLeaderboard from "@/components/TrendingLeaderboard";
import { AuthProvider } from "@/context/AuthContext";
import { RestaurantProvider, useRestaurants } from "@/context/RestaurantContext";

const RestaurantList = () => {
  const { filteredRestaurants } = useRestaurants();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredRestaurants.length > 0 ? (
        filteredRestaurants.map(restaurant => (
          <RestaurantCard
            key={restaurant.id}
            id={restaurant.id}
            name={restaurant.name}
            tagIds={restaurant.tagIds}
            googleMapsLink={restaurant.googleMapsLink}
            voteCount={restaurant.voteCount}
            imageUrl={restaurant.imageUrl}
          />
        ))
      ) : (
        <div className="col-span-full py-10 text-center">
          <h3 className="text-lg font-medium mb-2">No restaurants found</h3>
          <p className="text-neutral">Try removing some filters or check back later for new additions!</p>
        </div>
      )}
    </div>
  );
};

const IndexPage = () => {
  return (
    <AuthProvider>
      <RestaurantProvider>
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
              <p>© 2025 TopTabled – Discover London's best restaurants</p>
            </div>
          </footer>
        </div>
      </RestaurantProvider>
    </AuthProvider>
  );
};

export default IndexPage;
