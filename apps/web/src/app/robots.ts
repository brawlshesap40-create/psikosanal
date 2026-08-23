import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/danisan", "/psikolog", "/api"],
    },
    sitemap: `${siteConfig.siteUrl}/sitemap.xml`,
  };
}
