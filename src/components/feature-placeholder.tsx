"use client";

import { DashboardShell } from "@/components/dashboard-shell";

type FeaturePlaceholderProps = {
  description: string;
  title: string;
};

export function FeaturePlaceholder({ description, title }: FeaturePlaceholderProps) {
  return (
    <DashboardShell
      panelTitle={title}
      subtitle="This workspace is reserved for the next feature build."
      title={title}
    >
      <section className="scriptpilot-empty-feature">
        <p className="scriptpilot-eyebrow">Coming next</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </section>
    </DashboardShell>
  );
}
