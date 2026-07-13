"use client";

import Link from "next/link";
import { WEB_QUOTA_DISPLAY_ENABLED } from "@/lib/features/feature-flags";
import { type QuotaExceededError } from "@/lib/scriptpilot/api-client";

type QuotaCardProps = {
  action: string;
  isLoading: boolean;
  label: string;
};

export function QuotaCard({ action, isLoading, label }: QuotaCardProps) {
  if (!WEB_QUOTA_DISPLAY_ENABLED) return null;

  return (
    <div className="scriptpilot-quota-card">
      <p className="scriptpilot-panel-label">Daily quota</p>
      <p>{label}</p>
      <span>{isLoading ? "Working..." : action}</span>
    </div>
  );
}

export function ErrorPanel({ message }: { message: string }) {
  if (!message) return null;

  return <p className="scriptpilot-error-panel">{message}</p>;
}

export function FeatureLoadingState({
  message,
  title = "Working on it",
}: {
  message: string;
  title?: string;
}) {
  return (
    <div className="scriptpilot-feature-loading" role="status">
      <span aria-hidden="true" />
      <div>
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
    </div>
  );
}

export function QuotaExceededPanel({ error }: { error: QuotaExceededError | null }) {
  if (!error) return null;

  return (
    <div className="scriptpilot-upgrade-panel">
      <div>
        <h3>{error.quota.featureLabel} limit reached</h3>
        <p>
          Your {error.quota.plan} plan includes {error.quota.limit} daily uses.
        </p>
      </div>
      <Link className="scriptpilot-primary-action" href="/dashboard/premium-plans">
        View premium plans
      </Link>
    </div>
  );
}
