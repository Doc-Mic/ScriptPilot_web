import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
  title: "SEO Assistant - ScriptPilot",
};

export default function SeoAssistantLayout({ children }: { children: ReactNode }) {
  return children;
}
