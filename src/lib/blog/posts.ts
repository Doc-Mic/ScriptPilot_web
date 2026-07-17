import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export type BlogPostFrontmatter = {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  tags: string[];
  coverImage: string;
};

export type BlogPost = BlogPostFrontmatter & {
  content: string;
};

const blogDirectory = path.join(process.cwd(), "src", "content", "blog");

function asString(value: unknown, field: string, filePath: string) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Blog post ${filePath} is missing ${field}.`);
  }

  return value;
}

function asStringArray(value: unknown, field: string, filePath: string) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`Blog post ${filePath} must define ${field} as strings.`);
  }

  return value;
}

function parseFrontmatter(data: Record<string, unknown>, filePath: string) {
  const publishedAt = asString(data.publishedAt, "publishedAt", filePath);
  const publishedDate = new Date(publishedAt);

  if (Number.isNaN(publishedDate.getTime())) {
    throw new Error(`Blog post ${filePath} has an invalid publishedAt date.`);
  }

  return {
    coverImage: asString(data.coverImage, "coverImage", filePath),
    description: asString(data.description, "description", filePath),
    publishedAt,
    slug: asString(data.slug, "slug", filePath),
    tags: asStringArray(data.tags, "tags", filePath),
    title: asString(data.title, "title", filePath),
  } satisfies BlogPostFrontmatter;
}

async function readPostFile(fileName: string) {
  const filePath = path.join(blogDirectory, fileName);
  const rawFile = await fs.readFile(filePath, "utf8");
  const { content, data } = matter(rawFile);
  const frontmatter = parseFrontmatter(data, filePath);

  if (`${frontmatter.slug}.mdx` !== fileName) {
    throw new Error(
      `Blog post ${filePath} has slug "${frontmatter.slug}" that does not match its file name.`,
    );
  }

  return {
    ...frontmatter,
    content,
  } satisfies BlogPost;
}

export function isPublished(publishedAt: string, now = new Date()) {
  const publishDate = new Date(publishedAt);

  return !Number.isNaN(publishDate.getTime()) && publishDate <= now;
}

export async function getAllBlogPosts() {
  let fileNames: string[];

  try {
    fileNames = await fs.readdir(blogDirectory);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }

  const mdxFiles = fileNames.filter((fileName) => fileName.endsWith(".mdx"));
  const posts = await Promise.all(mdxFiles.map(readPostFile));

  return posts.sort(
    (left, right) =>
      new Date(right.publishedAt).getTime() -
      new Date(left.publishedAt).getTime(),
  );
}

export async function getPublishedBlogPosts(now = new Date()) {
  const posts = await getAllBlogPosts();

  return posts.filter((post) => isPublished(post.publishedAt, now));
}

export async function getBlogPostBySlug(slug: string) {
  try {
    return await readPostFile(`${slug}.mdx`);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

export async function getPublishedBlogPostBySlug(slug: string, now = new Date()) {
  const post = await getBlogPostBySlug(slug);

  if (!post || !isPublished(post.publishedAt, now)) {
    return null;
  }

  return post;
}

export function formatBlogDate(dateString: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateString));
}
