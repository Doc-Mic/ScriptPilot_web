import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "/blog",
  },
  description:
    "ScriptPilot blog posts for YouTube creators covering AI-assisted trends, video ideas, scripts, Shorts, and SEO workflows.",
  openGraph: {
    description:
      "Practical ScriptPilot articles for YouTube creators using AI to research, plan, write, and optimize content.",
    title: "ScriptPilot Blog",
    url: "/blog",
  },
  title: "Blog - ScriptPilot",
};

export default function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
