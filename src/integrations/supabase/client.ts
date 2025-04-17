
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://wmfkguyissncwjfmshxv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZmtndXlpc3NuY3dqZm1zaHh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MDMwMzgsImV4cCI6MjA2MDM3OTAzOH0.kN8hX0o_7JMsGfcRmRUTRiyqs6v2Xij_TVnubVYZZh4";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
