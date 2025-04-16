
import Navbar from "@/components/Navbar";
import TagFilter from "@/components/TagFilter";
import { AuthProvider } from "@/context/AuthContext";
import { RestaurantProvider } from "@/context/RestaurantContext";
import RestaurantGrid from "@/components/RestaurantGrid";
import TrendingLeaderboard from "@/components/TrendingLeaderboard";

const IndexPage = () => {
  return (
    <AuthProvider>
      <RestaurantProvider>
        <div className="min-h-screen bg-gradient-to-br from-secondary to-white">
          <Navbar />
          
          <div className="container mx-auto px-4 py-8">
            <header className="mb-12 text-center">
              <h1 className="font-serif text-4xl md:text-5xl mb-4 text-accent">
                Top London Restaurants
              </h1>
              <p className="text-neutral max-w-2xl mx-auto text-lg">
                A curated list of the best restaurants in London, rated by locals and food lovers. 
                Discover your next favorite spot!
              </p>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1">
                <div className="space-y-6 lg:sticky lg:top-4">
                  <TrendingLeaderboard />
                  <TagFilter />
                </div>
              </div>
              
              <div className="lg:col-span-3">
                <RestaurantGrid />
              </div>
            </div>
          </div>
          
          <footer className="mt-12 py-8 bg-white/50 backdrop-blur-sm border-t">
            <div className="container mx-auto px-4 text-center text-sm text-neutral">
              <p>© 2025 LeaderEats – Discover London's best restaurants</p>
            </div>
          </footer>
        </div>
      </RestaurantProvider>
    </AuthProvider>
  );
};

export default IndexPage;
