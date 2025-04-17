
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tag } from "@/data/tags";
import { Restaurant } from "@/data/restaurants";
import TagFilter from "@/components/TagFilter";
import SubmitRestaurantForm from "@/components/SubmitRestaurantForm";
import RestaurantGrid from "@/components/RestaurantGrid";
import TrendingLeaderboard from "@/components/TrendingLeaderboard";
import Navbar from "@/components/Navbar";
import { RestaurantProvider } from "@/context/RestaurantContext";

const Index = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  return (
    <RestaurantProvider>
      <div className="min-h-screen bg-slate-50">
        <Navbar onSubmitRestaurantClick={() => setIsSheetOpen(true)} />
        
        <main className="container mx-auto px-4 md:px-6 py-8">
          <h1 className="text-3xl font-bold text-center mb-8">
            Top Restaurant Recommendations in London
          </h1>
          
          <div className="flex flex-col lg:flex-row lg:gap-8">
            <div className="lg:w-8/12">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h2 className="text-xl font-semibold">All Restaurants</h2>
                <TagFilter />
              </div>
              
              <RestaurantGrid />
            </div>
            
            <div className="lg:w-4/12 mt-8 lg:mt-0">
              <TrendingLeaderboard />
            </div>
          </div>
        </main>
        
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Submit a Restaurant</SheetTitle>
              <SheetDescription>
                Share your favorite dining spot with the community.
              </SheetDescription>
            </SheetHeader>
            
            <div className="py-4">
              <SubmitRestaurantForm 
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                onSuccess={() => setIsSheetOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </RestaurantProvider>
  );
};

export default Index;
