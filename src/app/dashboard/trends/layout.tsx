import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Trends - ScriptPilot",
};

export default function TrendsLayout({ children }: { children: ReactNode }) {
  return children;
}
