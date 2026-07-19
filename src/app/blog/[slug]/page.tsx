import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatBlogDate,
  getPublishedBlogPostBySlug,
  getPublishedBlogPosts,
} from "@/lib/blog/posts";

export const revalidate = 3600;

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const posts = await getPublishedBlogPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Blog post not found - ScriptPilot",
    };
  }

  return {
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    description: post.description,
    openGraph: {
      description: post.description,
      images: [
        {
          alt: post.title,
          height: 630,
          url: post.coverImage,
          width: 1200,
        },
      ],
      publishedTime: post.publishedAt,
      tags: post.tags,
      title: `${post.title} - ScriptPilot`,
      type: "article",
      url: `/blog/${post.slug}`,
    },
    title: `${post.title} - ScriptPilot`,
    twitter: {
      card: "summary_large_image",
      description: post.description,
      images: [post.coverImage],
      title: `${post.title} - ScriptPilot`,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="marketing-screen scriptpilot-blog-screen">
      <article className="scriptpilot-blog-post-shell">
        <Link className="scriptpilot-blog-back-link" href="/blog">
          Back to blog
        </Link>

        <header className="scriptpilot-blog-post-header">
          <p className="scriptpilot-eyebrow">{formatBlogDate(post.publishedAt)}</p>
          <h1>{post.title}</h1>
          <p>{post.description}</p>
          <ul>
            {post.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </header>

        <Image
          alt=""
          className="scriptpilot-blog-post-image"
          height={630}
          priority
          src={post.coverImage}
          width={1200}
        />

        <div className="scriptpilot-mdx-content">
          <MDXRemote
            source={post.content}
            components={{
              a: (props) => <a {...props} />,
              h2: (props) => <h2 {...props} />,
              h3: (props) => <h3 {...props} />,
              li: (props) => <li {...props} />,
              p: (props) => <p {...props} />,
              ul: (props) => <ul {...props} />,
            }}
          />
        </div>
      </article>
    </main>
  );
}
