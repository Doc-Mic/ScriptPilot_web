"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { AboutPanel } from "@/components/settings/settings-sections";

export default function AboutPage() {
  return (
    <DashboardShell
      panelTitle="About ScriptPilot"
      subtitle="Version, credits, app info"
      title="About ScriptPilot"
    >
      <AboutPanel />
    </DashboardShell>
  );
}
