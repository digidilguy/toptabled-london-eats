// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://kaxrvkvhwokfujceoamu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtheHJ2a3Zod29rZnVqY2VvYW11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MDE3ODQsImV4cCI6MjA2MDQ3Nzc4NH0.NwfBGq3-L_YyhUrzUCSVBYZKxNIUAxCSe0kqrXMPZjk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);