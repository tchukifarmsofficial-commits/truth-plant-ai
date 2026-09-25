import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase as generatedClient } from '@/integrations/supabase/client';

// The app defines its own row types in src/types, so use a loosely typed client here.
export const supabase = generatedClient as unknown as SupabaseClient<any, 'public', any>;
