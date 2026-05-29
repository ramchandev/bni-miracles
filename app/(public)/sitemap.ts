import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { initiatives } from "@/lib/initiatives";
import { fetchPowerTeamsNav } from "@/lib/power-teams-server";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/members`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/attend-meeting`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/initiatives`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/power-team`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    ...initiatives.map((i) => ({
      url: `${SITE_URL}/initiatives/${i.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];

  let members: { slug: string; updated_at: string }[] = [];
  try {
    const { data } = await supabase.from("members").select("slug, updated_at").eq("is_active", true);
    members = data || [];
  } catch {
    members = [];
  }
  const memberPages: MetadataRoute.Sitemap = members.map((m) => ({
    url: `${SITE_URL}/members/${m.slug}`,
    lastModified: new Date(m.updated_at),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const powerTeams = await fetchPowerTeamsNav();
  const powerTeamPages: MetadataRoute.Sitemap = powerTeams.map((t) => ({
    url: `${SITE_URL}/power-team/${t.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...powerTeamPages, ...memberPages];
}
