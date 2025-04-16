
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useRestaurants } from '@/context/RestaurantContext';
import { tags, tagCategories, TagCategory } from '@/data/tags';
import { useAuth } from '@/context/AuthContext';

interface SubmitRestaurantFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubmitRestaurantForm = ({ isOpen, onClose }: SubmitRestaurantFormProps) => {
  const [name, setName] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('https://source.unsplash.com/random/300x200/?restaurant,food');
  const [isLoading, setIsLoading] = useState(false);
  const { addRestaurant } = useRestaurants();
  const { isAdmin } = useAuth();

  const handleClose = () => {
    // Reset form state
    setName('');
    setGoogleMapsLink('');
    setSelectedTagIds([]);
    setImageUrl('https://source.unsplash.com/random/300x200/?restaurant,food');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      addRestaurant({
        name,
        googleMapsLink,
        tagIds: selectedTagIds,
        imageUrl
      });
      
      handleClose();
    } catch (error) {
      console.error('Error adding restaurant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const renderTagsByCategory = (category: TagCategory) => {
    const categoryTags = tags.filter(tag => tag.category === category);
    
    return (
      <div className="space-y-2 mt-2">
        <h4 className="font-medium text-sm">{
          tagCategories.find(c => c.id === category)?.name || category
        }</h4>
        <div className="grid grid-cols-2 gap-2">
          {categoryTags.map(tag => (
            <div key={tag.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`tag-${tag.id}`}
                checked={selectedTagIds.includes(tag.id)}
                onCheckedChange={() => handleTagToggle(tag.id)}
              />
              <Label htmlFor={`tag-${tag.id}`} className="text-sm cursor-pointer">
                {tag.name}
              </Label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {isAdmin ? 'Add a New Restaurant' : 'Submit a Restaurant'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="restaurant-name">Restaurant Name</Label>
            <Input 
              id="restaurant-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dishoom"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="google-maps-link">Google Maps Link</Label>
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
          
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="space-y-4 max-h-60 overflow-y-auto p-2 border rounded">
              {(Object.keys(tagCategories) as TagCategory[]).map(category => 
                renderTagsByCategory(category as TagCategory)
              )}
            </div>
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
