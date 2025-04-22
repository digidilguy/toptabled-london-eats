
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRestaurants } from "@/context/RestaurantContext";
import { tagCategories } from "@/data/tagCategories";
import { TagCategory } from "@/types/restaurant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TagFilter = () => {
  const { activeTagIds, toggleTagFilter, clearTagFilters, availableTags, restaurants } = useRestaurants();
  
  console.log('TagFilter - available tags:', availableTags);
  console.log('TagFilter - active tag IDs:', activeTagIds);

  const getTagsForCategory = (category: TagCategory) => {
    const tagColumnMap = {
      'area': 'area_tag',
      'cuisine': 'cuisine_tag',
      'awards': 'awards_tag',
      'dietary': 'dietary_tag'
    };

    const columnName = tagColumnMap[category];
    const uniqueTags = new Set<string>();
    
    restaurants.forEach(restaurant => {
      const tagValue = restaurant[columnName as keyof typeof restaurant];
      if (tagValue && typeof tagValue === 'string') {
        uniqueTags.add(tagValue);
      }
    });

    return Array.from(uniqueTags).map(tagId => ({
      id: tagId,
      name: tagId.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      category
    }));
  };
  
  const renderTagsByCategory = (category: TagCategory) => {
    const categoryTags = getTagsForCategory(category);
    
    if (categoryTags.length === 0) {
      return <p className="text-xs text-muted-foreground italic">No {category} tags available</p>;
    }
    
    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {categoryTags.map(tag => {
          const isSelected = activeTagIds.includes(tag.id);
          return (
            <Badge 
              key={tag.id}
              variant={isSelected ? "default" : "outline"}
              className={`cursor-pointer text-xs py-1.5 px-3 ${
                isSelected 
                  ? "badge-selected" 
                  : "bg-transparent border border-border text-foreground hover:bg-secondary/80"
              }`}
              onClick={() => toggleTagFilter(tag.id)}
            >
              {tag.name}
            </Badge>
          );
        })}
      </div>
    );
  };
  
  const hasActiveFilters = activeTagIds.length > 0;
  
  const getSelectedTagNames = () => {
    const allTags = tagCategories.flatMap(category => 
      getTagsForCategory(category.id as TagCategory)
    );
    
    return activeTagIds.map(id => {
      const tag = allTags.find(t => t.id === id);
      return tag ? tag.name : '';
    }).filter(Boolean);
  };

  return (
    <Card className="glass border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-foreground">Filter Restaurants</CardTitle>
      </CardHeader>
      <CardContent>
        {hasActiveFilters && (
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-foreground mb-2">Active filters:</p>
              <div className="flex flex-wrap gap-1">
                {getSelectedTagNames().map((name, index) => (
                  <span key={index} className="text-xs badge-selected px-2 py-1 rounded">
                    {name}
                  </span>
                ))}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearTagFilters}
              className="text-xs text-foreground hover:bg-secondary/80"
            >
              Clear all
            </Button>
          </div>
        )}
        
        <Tabs defaultValue="area" className="w-full">
          <TabsList className="mb-4 w-full grid grid-cols-4 gap-1 rounded-full bg-background p-1">
            {tagCategories.map(category => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="rounded-full text-xs whitespace-nowrap px-2 py-1.5"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {tagCategories.map(category => (
            <TabsContent key={category.id} value={category.id} className="p-1">
              {renderTagsByCategory(category.id as TagCategory)}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TagFilter;
