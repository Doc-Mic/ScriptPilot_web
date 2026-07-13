"use client";

import Link from "next/link";
import { DashboardShell, workflowCards } from "@/components/dashboard-shell";

export default function DashboardPage() {
  return (
    <DashboardShell
      mode="hub"
      subtitle="Plan, script, package, and publish YouTube ideas from one focused workspace."
      title="Creator Dashboard"
    >
      <div className="scriptpilot-dashboard-intro">
        <div>
          <p className="scriptpilot-eyebrow">Workspace</p>
          <h2>Choose a workflow</h2>
          <p>Start with trends, generate ideas, write scripts, create Shorts, or prepare SEO metadata.</p>
        </div>
      </div>

      <div className="scriptpilot-workflow-grid">
        {workflowCards.map(({ href, icon: Icon, labels, subtitle, title }) => (
          <Link className="scriptpilot-workflow-card" href={href} key={title}>
            <div>
              <span className="scriptpilot-workflow-icon">
                <Icon size={24} strokeWidth={2.4} />
              </span>
              <h3>{title}</h3>
              <p>{subtitle}</p>
            </div>
            <div className="scriptpilot-workflow-badges">
              {labels.map((label) => (
                <span className="scriptpilot-pill" key={label}>
                  {label}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}
