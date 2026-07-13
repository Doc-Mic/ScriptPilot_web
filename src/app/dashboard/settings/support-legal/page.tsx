"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { SupportLegalPanel } from "@/components/settings/settings-sections";

export default function SupportLegalPage() {
  return (
    <DashboardShell
      panelTitle="Support & Legal"
      subtitle="Privacy, contact, terms"
      title="Support & Legal"
    >
      <SupportLegalPanel />
    </DashboardShell>
  );
}
