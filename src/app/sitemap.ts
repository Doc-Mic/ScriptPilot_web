import type { MetadataRoute } from "next";
import { getPublishedBlogPosts } from "@/lib/blog/posts";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://scriptpilot.studio"
).replace(/\/$/, "");

const staticPageLastModified = new Date("2026-07-17T00:00:00.000Z");

const publicRoutes = [
  {
    lastModified: staticPageLastModified,
    path: "/",
  },
  {
    lastModified: staticPageLastModified,
    path: "/login",
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedBlogPosts();
  const blogLastModified =
    posts[0] ? new Date(posts[0].publishedAt) : staticPageLastModified;

  const routes = [
    ...publicRoutes,
    {
      lastModified: blogLastModified,
      path: "/blog",
    },
  ];

  return [
    ...routes.map((route) => ({
      lastModified: route.lastModified,
      url: `${siteUrl}${route.path}`,
    })),
    ...posts.map((post) => ({
      lastModified: new Date(post.publishedAt),
      url: `${siteUrl}/blog/${post.slug}`,
    })),
  ];
}
