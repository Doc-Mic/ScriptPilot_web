"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { PreferencesPanel } from "@/components/settings/settings-sections";

export default function PreferencesPage() {
  return (
    <DashboardShell
      panelTitle="Settings"
      subtitle="Theme, preferences, notifications"
      title="Settings"
    >
      <PreferencesPanel />
    </DashboardShell>
  );
}
