import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Generate Ideas - ScriptPilot",
};

export default function IdeasLayout({ children }: { children: ReactNode }) {
  return children;
}
