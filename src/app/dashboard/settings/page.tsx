"use client";

import { Info, Shield, SlidersHorizontal, User } from "lucide-react";
import { useMemo } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { useAuth } from "@/components/auth-provider";
import {
  SettingsLogoutButton,
  SettingsNavCard,
} from "@/components/settings/settings-sections";
import { useCurrentUserDocument } from "@/hooks/use-current-user-document";
import { useSavedProjectCount } from "@/hooks/use-saved-projects";

export default function SettingsPage() {
  const { user } = useAuth();
  const { data } = useCurrentUserDocument();
  const projectCount = useSavedProjectCount();

  const stats = useMemo(() => {
    const scriptCount = data?.usage?.scriptGeneration?.count ?? 0;
    const ideaCount = data?.usage?.ideaGeneration?.count ?? 0;

    return [
      { label: "Scripts created", value: scriptCount },
      { label: "Ideas generated", value: ideaCount },
      {
        label: "Projects saved",
        value: projectCount.loading ? "..." : projectCount.count,
      },
    ];
  }, [data, projectCount.count, projectCount.loading]);

  return (
    <DashboardShell
      mode="hub"
      subtitle="AI workspace for YouTube creators"
      title="Profile & Settings"
    >
      <div className="scriptpilot-settings-page">
        <section className="scriptpilot-profile-card">
          <div className="scriptpilot-profile-avatar">
            <User size={30} />
          </div>
          <div>
            <p className="scriptpilot-eyebrow">Signed in</p>
            <h2>{user?.displayName || "ScriptPilot Creator"}</h2>
            <p>{user?.email || "Creator workspace"}</p>
          </div>
        </section>

        <section className="scriptpilot-profile-stats" aria-label="Creator stats">
          {stats.map((item) => (
            <div key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </section>

        <section className="scriptpilot-settings-section">
          <h2>Creator workspace</h2>
          <div className="scriptpilot-settings-card-grid">
            <SettingsNavCard
              href="/dashboard/premium-plans"
              subtitle="Unlock unlimited AI workflows"
              title="Premium Plans"
            />
            <SettingsNavCard
              href="/dashboard/settings/preferences"
              icon={<SlidersHorizontal size={20} />}
              subtitle="Theme, preferences, notifications"
              title="Settings"
            />
            <SettingsNavCard
              href="/dashboard/settings/support-legal"
              icon={<Shield size={20} />}
              subtitle="Privacy, contact, terms"
              title="Support & Legal"
            />
            <SettingsNavCard
              href="/dashboard/settings/about"
              icon={<Info size={20} />}
              subtitle="Version, credits, app info"
              title="About ScriptPilot"
            />
          </div>
        </section>

        <section className="scriptpilot-settings-section">
          <SettingsLogoutButton />
        </section>
      </div>
    </DashboardShell>
  );
}
