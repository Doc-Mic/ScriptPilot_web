import Image from "next/image";
import Link from "next/link";
import { formatBlogDate, getPublishedBlogPosts } from "@/lib/blog/posts";

export const revalidate = 3600;

export default async function BlogIndexPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <main className="marketing-screen scriptpilot-blog-screen">
      <section className="scriptpilot-blog-shell">
        <header className="scriptpilot-blog-header">
          <Link className="scriptpilot-blog-back-link" href="/">
            ScriptPilot
          </Link>
          <p className="scriptpilot-eyebrow">Creator resources</p>
          <h1>ScriptPilot Blog</h1>
          <p>
            Practical notes for YouTube creators using AI to research trends,
            shape better video ideas, draft scripts, create Shorts, and improve
            SEO before publishing.
          </p>
        </header>

        <div className="scriptpilot-blog-grid">
          {posts.map((post) => (
            <Link
              className="scriptpilot-blog-card"
              href={`/blog/${post.slug}`}
              key={post.slug}
            >
              <Image
                alt=""
                className="scriptpilot-blog-card-image"
                height={630}
                priority={posts[0]?.slug === post.slug}
                src={post.coverImage}
                width={1200}
              />
              <div>
                <span>{formatBlogDate(post.publishedAt)}</span>
                <h2>{post.title}</h2>
                <p>{post.description}</p>
                <ul>
                  {post.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
