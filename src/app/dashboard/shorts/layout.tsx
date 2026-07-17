import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
  title: "Shorts - ScriptPilot",
};

export default function ShortsLayout({ children }: { children: ReactNode }) {
  return children;
}
