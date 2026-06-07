// Non-server types and constants for the Dance Card feature.
// Imported by both server actions and client components.

export type ContactSphereEntry = { name: string; profession: string };
export type CustomerEntry      = { name: string; notes: string };

export type DanceCardData = {
  // BIO Sheet
  bio_profession:     string;
  bio_location:       string;
  bio_years:          string;
  bio_previous_jobs:  string;
  bio_spouse:         string;
  bio_children:       string;
  bio_animals:        string;
  bio_hobbies:        string;
  bio_activities:     string;
  bio_city:           string;
  bio_city_duration:  string;
  bio_burning_desire: string;
  bio_secret:         string;
  bio_key_to_success: string;
  // GAINS
  gains_goals:           string;
  gains_accomplishments: string;
  gains_interests:       string;
  gains_networks:        string;
  gains_skills:          string;
  // Contact Sphere
  contact_sphere:    ContactSphereEntry[];
  top_3_professions: string[];
  // Last 10 Customers
  last_customers:   CustomerEntry[];
  referral_sources: string;
  good_referrals:   string;
  bad_referrals:    string;
};

export type DanceCardRow = DanceCardData & {
  id:               string;
  member_id:        string;
  pdf_generated_at: string | null;
  created_at:       string;
  updated_at:       string;
};

export const EMPTY_DATA: DanceCardData = {
  bio_profession: "", bio_location: "", bio_years: "",
  bio_previous_jobs: "", bio_spouse: "", bio_children: "",
  bio_animals: "", bio_hobbies: "", bio_activities: "",
  bio_city: "", bio_city_duration: "",
  bio_burning_desire: "", bio_secret: "", bio_key_to_success: "",
  gains_goals: "", gains_accomplishments: "", gains_interests: "",
  gains_networks: "", gains_skills: "",
  contact_sphere:    Array.from({ length: 10 }, () => ({ name: "", profession: "" })),
  top_3_professions: ["", "", ""],
  last_customers:    Array.from({ length: 10 }, () => ({ name: "", notes: "" })),
  referral_sources: "", good_referrals: "", bad_referrals: "",
};
