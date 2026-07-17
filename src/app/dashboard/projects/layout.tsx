import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
  title: "My Projects - ScriptPilot",
};

export default function ProjectsLayout({ children }: { children: ReactNode }) {
  return children;
}
