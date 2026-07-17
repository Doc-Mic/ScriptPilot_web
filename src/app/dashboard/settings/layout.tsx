import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
  title: "Settings - ScriptPilot",
};

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return children;
}
