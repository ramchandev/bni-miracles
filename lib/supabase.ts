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
  email: string | null;
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

export type PowerTeam = {
  id: string;
  slug: string;
  name: string;
  focus_area: string | null;
  description: string | null;
  emoji: string;
  color: string;
  sort_order: number;
  captain_member_id: string | null;
  created_at: string;
  updated_at: string;
};

export type PowerTeamMember = {
  id: string;
  power_team_id: string;
  member_id: string;
  role_notes: string | null;
  sort_order: number;
  created_at: string;
};

export type PowerTeamMemberWithMember = PowerTeamMember & {
  members: Pick<
    Member,
    "id" | "name" | "slug" | "category" | "business_name" | "business_location" | "profile_picture_url" | "is_active"
  > | null;
};

export type PowerTeamWithMembers = PowerTeam & {
  power_team_members: PowerTeamMemberWithMember[];
};

export type LeadershipGroup = {
  id: string;
  name: string;
  subtitle: string | null;
  color: string;
  non_members: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type LeadershipRole = {
  id: string;
  group_id: string;
  name: string;
  description: string | null;
  sort_order: number;
  created_at: string;
};

export type LeadershipAssignment = {
  id: string;
  role_id: string;
  member_id: string | null;
  assignee_name: string | null;
  assignee_profile_picture_url: string | null;
  created_at: string;
};

export type LeadershipAssignmentWithMember = LeadershipAssignment & {
  members: Pick<
    Member,
    "id" | "name" | "slug" | "category" | "business_name" | "profile_picture_url"
  > | null;
};

export type LeadershipRoleWithAssignments = LeadershipRole & {
  leadership_assignments: LeadershipAssignmentWithMember[];
};

export type LeadershipGroupWithRoles = LeadershipGroup & {
  leadership_roles: LeadershipRoleWithAssignments[];
};
