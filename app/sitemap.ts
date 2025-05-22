import { Videos } from "@/lib/constants";
import type { MetadataRoute } from "next";

function toSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const lastModified = new Date();

  const videos: MetadataRoute.Sitemap = Videos.map((video) => ({
    url: `${baseUrl}learn/shadowing/${toSlug(video.title)}`,
    lastModified,
    changeFrequency: "never",
    priority: 0.8,
  }));

  return [
    {
      url: `${baseUrl}`,
      lastModified,
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: `${baseUrl}learn/practice`,
      lastModified,
      changeFrequency: "always",
      priority: 0.8,
    },
    {
      url: `${baseUrl}learn/talk`,
      lastModified,
      changeFrequency: "always",
      priority: 0.8,
    },
    {
      url: `${baseUrl}learn/shadowing`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...videos,
  ];
}
