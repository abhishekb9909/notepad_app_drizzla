import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iowrugkdgffqidbohpny.supabase.co'
const supabaseKey = 'sb_publishable_Xp7_oeNDD_IfjqKhrdS4yw_G83ojOgv'

export const supabase = createClient(supabaseUrl, supabaseKey)
