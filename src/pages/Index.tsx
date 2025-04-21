
import { useState } from "react";
import Navbar from "@/components/Navbar";
import TagFilter from "@/components/TagFilter";
import { RestaurantProvider } from "@/context/RestaurantContext";
import RestaurantGrid from "@/components/RestaurantGrid";
import TrendingLeaderboard from "@/components/TrendingLeaderboard";
import SubmitRestaurantForm from "@/components/SubmitRestaurantForm";

const IndexPage = () => {
  const [isSubmitFormOpen, setIsSubmitFormOpen] = useState(false);

  return (
    <RestaurantProvider>
      {/* Add subtle food pattern background */}
      <div className="min-h-screen bg-background food-pattern-bg">
        <Navbar onSubmitRestaurantClick={() => setIsSubmitFormOpen(true)} />

        <div className="container mx-auto px-4 py-8">
          <header className="mb-12 text-center">
            <h1
              className="text-4xl md:text-5xl mb-4 font-sans font-bold inline-block px-4 py-2 rounded-md bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white shadow-md"
            >
              LeaderEats
            </h1>
            <p className="text-white max-w-2xl mx-auto text-lg">
              Discover London’s top restaurants, ranked by locals — and vote for your favorites to make your voice heard!
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
        
        <footer className="mt-12 py-8 bg-background backdrop-blur-sm border-t border-accent/10">
          <div className="container mx-auto px-4 text-center text-sm text-white">
            <p>© 2025 LeaderEats – Discover London's best restaurants</p>
          </div>
        </footer>

        <SubmitRestaurantForm
          isOpen={isSubmitFormOpen}
          onClose={() => setIsSubmitFormOpen(false)}
        />
      </div>
    </RestaurantProvider>
  );
};

export default IndexPage;
