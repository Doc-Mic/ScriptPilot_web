"use client";

import {
  ArrowLeft,
  FileText,
  Folder,
  Home,
  Lightbulb,
  LogOut,
  Search,
  Settings,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";
import { signOut } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { getFirebaseAuth } from "@/lib/firebase/client";

type DashboardShellProps = {
  children: ReactNode;
  framedClassName?: string;
  mode?: "hub" | "feature";
  panelTitle?: string;
  subtitle: string;
  title: string;
};

const navItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/dashboard/trends", icon: TrendingUp, label: "Find Trends" },
  { href: "/dashboard/ideas", icon: Lightbulb, label: "Generate Ideas" },
  { href: "/dashboard/script-studio", icon: FileText, label: "Script Studio" },
  { href: "/dashboard/shorts", icon: Zap, label: "Shorts" },
  { href: "/dashboard/seo-assistant", icon: Search, label: "SEO Assistant" },
  { href: "/dashboard/projects", icon: Folder, label: "My Projects" },
  { href: "/dashboard/premium-plans", icon: User, label: "Plans" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export const workflowCards = [
  {
    href: "/dashboard/trends",
    icon: TrendingUp,
    labels: ["Trending", "AI powered"],
    subtitle: "Spot what is heating up",
    title: "Find Trends",
  },
  {
    href: "/dashboard/ideas",
    icon: Lightbulb,
    labels: ["AI powered", "Fast"],
    subtitle: "Angles from any topic",
    title: "Generate Ideas",
  },
  {
    href: "/dashboard/script-studio",
    icon: FileText,
    labels: ["Creator tool", "AI powered"],
    subtitle: "Write full scripts",
    title: "Script Studio",
  },
  {
    href: "/dashboard/shorts",
    icon: Zap,
    labels: ["Fast", "Trending"],
    subtitle: "Turn ideas into shorts",
    title: "Shorts",
  },
  {
    href: "/dashboard/seo-assistant",
    icon: Search,
    labels: ["SEO", "AI powered"],
    subtitle: "Optimize for search",
    title: "SEO Assistant",
  },
  {
    href: "/dashboard/projects",
    icon: Folder,
    labels: ["Saved", "Workspace"],
    subtitle: "Review saved work",
    title: "My Projects",
  },
];

export function DashboardShell({
  children,
  framedClassName = "",
  mode = "feature",
  panelTitle,
  subtitle,
  title,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { loading, user } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, router, user]);

  if (loading || !user) {
    return (
      <main className="scriptpilot-screen">
        <section className="scriptpilot-auth-state">
          <p className="scriptpilot-eyebrow">ScriptPilot</p>
          <h1>{loading ? "Checking your session" : "Redirecting to login"}</h1>
          <p>{loading ? "Loading..." : "Please sign in to continue."}</p>
        </section>
      </main>
    );
  }

  async function handleSignOut() {
    await signOut(getFirebaseAuth());
    router.replace("/login");
  }

  return (
    <main className="scriptpilot-screen">
      <div className="scriptpilot-app-shell">
        <aside className="scriptpilot-sidebar">
          <Link className="scriptpilot-brand" href="/dashboard">
            <Image
              alt="ScriptPilot logo"
              className="scriptpilot-brand-logo"
              height={42}
              src="/scriptpilot-logo.png"
              width={42}
            />
            <span>
              <span className="scriptpilot-brand-name">ScriptPilot</span>
              <span className="scriptpilot-brand-caption">Creator workspace</span>
            </span>
          </Link>

          <nav className="scriptpilot-side-nav" aria-label="Dashboard navigation">
            {navItems.map(({ href, icon: Icon, label }) => {
              const active =
                href === "/dashboard"
                  ? pathname === href
                  : pathname.startsWith(href);

              return (
                <Link
                  className={`scriptpilot-side-nav-item ${active ? "active" : ""}`}
                  href={href}
                  key={href}
                >
                  <Icon size={19} strokeWidth={2.35} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="scriptpilot-sidebar-footer">
            <p>{user.email ?? "Signed in"}</p>
            <button
              className="scriptpilot-signout-button"
              onClick={handleSignOut}
              type="button"
            >
              <LogOut size={18} strokeWidth={2.35} />
              Sign out
            </button>
          </div>
        </aside>

        <section className="scriptpilot-main">
          <header className="scriptpilot-topbar">
            <div>
              <p className="scriptpilot-eyebrow">AI creator assistant</p>
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </div>
          </header>

          <div className={`scriptpilot-content-panel ${framedClassName}`}>
            {mode === "feature" ? (
              <FeatureHeader title={panelTitle ?? title} />
            ) : null}
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}

function FeatureHeader({ title }: { title: string }) {
  const router = useRouter();

  return (
    <div className="scriptpilot-feature-header">
      <button
        aria-label="Go back"
        className="scriptpilot-icon-button"
        onClick={() => router.back()}
        type="button"
      >
        <ArrowLeft size={20} strokeWidth={2.5} />
      </button>
      <h2>{title}</h2>
      <Link
        aria-label="Go to dashboard"
        className="scriptpilot-icon-button"
        href="/dashboard"
      >
        <Home size={20} strokeWidth={2.5} />
      </Link>
    </div>
  );
}
