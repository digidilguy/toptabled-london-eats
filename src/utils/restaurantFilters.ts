
import { TagCategory } from "@/types/restaurant";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/integrations/supabase/types";

interface FilterConfig {
  activeTagIds: string[];
  activeTagsByCategory?: Record<TagCategory, string[]>;
}

// Use a more specific type for the query parameter
export const applyRestaurantFilters = <T>(
  query: ReturnType<SupabaseClient<Database>['from']>,
  filters: FilterConfig
) => {
  if (!filters.activeTagIds.length || !filters.activeTagsByCategory) {
    return query;
  }

  const categories = Object.keys(filters.activeTagsByCategory) as TagCategory[];
  
  categories.forEach(category => {
    const tagsInCategory = filters.activeTagsByCategory![category];
    
    if (!tagsInCategory?.length) return;
    
    const tagColumn = `${category}_tag`;
    
    if (tagsInCategory.length > 1) {
      query.in(tagColumn, tagsInCategory);
    } else if (tagsInCategory.length === 1) {
      query.eq(tagColumn, tagsInCategory[0]);
    }
  });

  return query;
};
