import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  description:
    "ScriptPilot is an AI-powered YouTube creator assistant for discovering trends, generating video ideas, writing scripts, creating Shorts, and optimizing video SEO.",
  openGraph: {
    description:
      "Discover trends, generate YouTube ideas, draft scripts, create Shorts, and prepare SEO metadata with ScriptPilot.",
    images: [
      {
        alt: "ScriptPilot logo",
        height: 1200,
        url: "/scriptpilot-logo.png",
        width: 1200,
      },
    ],
    title: "ScriptPilot - AI-powered YouTube creator assistant",
    url: "/",
  },
  title: "ScriptPilot - AI-powered YouTube creator assistant for trends, scripts, and SEO",
};

export default function Home() {
  return (
    <main className="marketing-screen">
      <section className="marketing-shell">
        <div className="marketing-hero">
          <div className="marketing-logo-lockup">
            <Image
              alt="ScriptPilot logo"
              height={54}
              src="/scriptpilot-logo.png"
              width={54}
            />
            <p className="scriptpilot-eyebrow">ScriptPilot Web</p>
          </div>
          <h1>AI workspace for YouTube creators.</h1>
          <p>
            Research trends, generate video ideas, write scripts, shape Shorts,
            and prepare SEO metadata in one professional creator dashboard.
          </p>
          <p>
            ScriptPilot helps YouTube creators move from topic research to
            publish-ready content faster. Use AI-assisted trend discovery, idea
            generation, script drafting, Shorts planning, and searchable titles,
            descriptions, and tags from a single web workspace.
          </p>

          <div className="marketing-actions">
            <Link className="button-primary" href="/login">
              Sign in
            </Link>
            <Link className="button-secondary" href="/dashboard">
              Open dashboard
            </Link>
          </div>
        </div>

        <div className="marketing-card" aria-label="ScriptPilot workflows">
          <div>
            <strong>Find Trends</strong>
            <span>Spot topics gaining momentum before they peak.</span>
          </div>
          <div>
            <strong>Script Studio</strong>
            <span>Move from idea to structured script faster.</span>
          </div>
          <div>
            <strong>SEO Assistant</strong>
            <span>Package videos with searchable titles, descriptions, and tags.</span>
          </div>
        </div>
      </section>
    </main>
  );
}
