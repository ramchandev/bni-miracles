import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Member = {
  id: string;
  name: string;
  slug: string;
  business_name: string;
  category: string;
  phone: string | null;
  business_location: string | null;
  website: string | null;
  services: string | null;
  why_choose_us: string | null;
  success_stories: string | null;
  profile_picture_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CategoryGroup = {
  id: string;
  name: string;
  sort_order: number;
  created_at: string;
};

export type BusinessCategory = {
  id: string;
  group_id: string | null;
  name: string;
  icon: string;
  sort_order: number;
  created_at: string;
  // joined
  category_groups?: CategoryGroup | null;
};

export type GiveAsk = {
  id: string;
  member_id: string;
  type: 'give' | 'ask';
  item: string;
  sort_order: number;
  created_at: string;
};

export type MeetingRegistration = {
  id: string;
  name: string;
  phone: string;
  meeting_date: string;
  created_at: string;
};

export type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: string;
};
