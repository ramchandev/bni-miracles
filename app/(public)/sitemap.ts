import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { initiatives } from "@/lib/initiatives";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://bnimiracles.in";

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), priority: 1.0 },
    { url: `${base}/about`, lastModified: new Date(), priority: 0.9 },
    { url: `${base}/members`, lastModified: new Date(), priority: 0.9 },
    { url: `${base}/attend-meeting`, lastModified: new Date(), priority: 0.9 },
    { url: `${base}/initiatives`, lastModified: new Date(), priority: 0.8 },
    { url: `${base}/contact`, lastModified: new Date(), priority: 0.7 },
    ...initiatives.map((i) => ({
      url: `${base}/initiatives/${i.slug}`,
      lastModified: new Date(),
      priority: 0.7 as const,
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
    url: `${base}/members/${m.slug}`,
    lastModified: new Date(m.updated_at),
    priority: 0.6,
  }));

  return [...staticPages, ...memberPages];
}
