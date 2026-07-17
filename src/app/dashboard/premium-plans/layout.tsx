import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
  title: "Premium Plans - ScriptPilot",
};

export default function PremiumPlansLayout({ children }: { children: ReactNode }) {
  return children;
}
