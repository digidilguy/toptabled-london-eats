
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRestaurants } from "@/context/RestaurantContext";
import { tags, tagCategories, Tag, TagCategory } from "@/data/tags";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold">Filter Restaurants</CardTitle>
      </CardHeader>
      <CardContent>
        {hasActiveFilters && (
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-neutral mb-2">Active filters:</p>
              <div className="flex flex-wrap gap-1">
                {getSelectedTagNames().map((name, index) => (
                  <span key={index} className="text-xs bg-accent text-white px-2 py-1 rounded">
                    {name}
                  </span>
                ))}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearTagFilters}
              className="text-xs"
            >
              Clear all
            </Button>
          </div>
        )}
        
        <Tabs defaultValue="area" className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-2">
            {tagCategories.map(category => (
              <TabsTrigger key={category.id} value={category.id}>
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
      </CardContent>
    </Card>
  );
};

export default TagFilter;
