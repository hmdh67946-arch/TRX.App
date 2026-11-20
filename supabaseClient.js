import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ldtrgapqkgfirlkyvmvb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hBHS-f1WbemIBA5j1mi6sw_93WFhlcK';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
