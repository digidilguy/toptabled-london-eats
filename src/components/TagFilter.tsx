
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRestaurants } from "@/context/RestaurantContext";
import { tags, tagCategories, Tag, TagCategory } from "@/data/tags";

const TagFilter = () => {
  const { activeTagIds, toggleTagFilter, clearTagFilters } = useRestaurants();
  
  const renderTagsByCategory = (category: TagCategory) => {
    const categoryTags = tags.filter(tag => tag.category === category);
    
    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {categoryTags.map(tag => (
          <Badge 
            key={tag.id}
            variant={activeTagIds.includes(tag.id) ? "default" : "outline"}
            className="cursor-pointer text-xs py-1.5"
            onClick={() => toggleTagFilter(tag.id)}
          >
            {tag.name}
          </Badge>
        ))}
      </div>
    );
  };
  
  const hasActiveFilters = activeTagIds.length > 0;
  
  const getSelectedTagNames = () => {
    return activeTagIds.map(id => {
      const tag = tags.find(t => t.id === id);
      return tag ? tag.name : '';
    }).filter(Boolean);
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Filter Restaurants</h2>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearTagFilters}
            className="text-xs"
          >
            Clear all filters
          </Button>
        )}
      </div>
      
      {hasActiveFilters && (
        <div className="mb-4">
          <p className="text-sm text-neutral mb-2">Active filters:</p>
          <div className="flex flex-wrap gap-1">
            {getSelectedTagNames().map((name, index) => (
              <span key={index} className="text-xs bg-accent text-white px-2 py-1 rounded">
                {name}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <Tabs defaultValue="area">
        <TabsList className="w-full">
          {tagCategories.map(category => (
            <TabsTrigger key={category.id} value={category.id} className="flex-1">
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {tagCategories.map(category => (
          <TabsContent key={category.id} value={category.id}>
            {renderTagsByCategory(category.id as TagCategory)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default TagFilter;
