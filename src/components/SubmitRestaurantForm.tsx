
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRestaurants } from '@/context/RestaurantContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/hooks/use-toast";

interface SubmitRestaurantFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubmitRestaurantForm = ({ isOpen, onClose }: SubmitRestaurantFormProps) => {
  const [name, setName] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [imageUrl, setImageUrl] = useState('https://source.unsplash.com/random/300x200/?restaurant,food');
  const [isLoading, setIsLoading] = useState(false);
  const { addRestaurant } = useRestaurants();
  const { isAdmin, isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  const handleClose = () => {
    // Reset form state
    setName('');
    setGoogleMapsLink('');
    setImageUrl('https://source.unsplash.com/random/300x200/?restaurant,food');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to submit a restaurant",
        variant: "destructive",
      });
      return;
    }

    if (!name || !googleMapsLink) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Submitting restaurant from form:', {
        name,
        googleMapsLink,
        imageUrl,
        userId: user?.id
      });
      
      await addRestaurant({
        name,
        googleMapsLink,
        imageUrl,
      });
      
      toast({
        title: isAdmin ? "Restaurant added" : "Restaurant submitted for review",
        description: isAdmin 
          ? `${name} has been added to the list` 
          : `${name} has been submitted and will be reviewed by an admin`,
      });
      
      handleClose();
    } catch (error) {
      console.error('Error adding restaurant:', error);
      toast({
        title: "Error",
        description: "There was an error submitting the restaurant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {isAdmin ? 'Add a New Restaurant' : 'Submit a Restaurant'}
          </DialogTitle>
          <DialogDescription>
            {isAdmin 
              ? "Add a new restaurant to the database" 
              : "Submit a restaurant for review by our admins"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="restaurant-name">Restaurant Name *</Label>
            <Input 
              id="restaurant-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dishoom"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="google-maps-link">Google Maps Link *</Label>
            <Input 
              id="google-maps-link"
              value={googleMapsLink}
              onChange={(e) => setGoogleMapsLink(e.target.value)}
              placeholder="https://goo.gl/maps/..."
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image-url">Image URL (Optional)</Label>
            <Input 
              id="image-url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          
          <div className="pt-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Submitting..." : isAdmin ? "Add Restaurant" : "Submit for Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitRestaurantForm;
