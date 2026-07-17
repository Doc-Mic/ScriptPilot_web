import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
  title: "Trends - ScriptPilot",
};

export default function TrendsLayout({ children }: { children: ReactNode }) {
  return children;
}
