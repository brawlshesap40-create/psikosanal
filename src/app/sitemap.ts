import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { getApprovedPsychologistSlugs } from "@/lib/psychologists/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const psychologists = await getApprovedPsychologistSlugs();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteConfig.siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.siteUrl}/psikologlar`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteConfig.siteUrl}/kayit/danisan`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteConfig.siteUrl}/kayit/psikolog`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const psychologistRoutes: MetadataRoute.Sitemap = psychologists.map((p) => ({
    url: `${siteConfig.siteUrl}/psikologlar/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...psychologistRoutes];
}
