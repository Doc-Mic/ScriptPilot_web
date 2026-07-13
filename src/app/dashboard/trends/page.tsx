"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { FeatureLoadingState } from "@/components/feature-status";
import { useCurrentUserDocument } from "@/hooks/use-current-user-document";
import { WEB_QUOTA_DISPLAY_ENABLED } from "@/lib/features/feature-flags";
import {
  QuotaExceededError,
  ScriptPilotApiError,
  scriptPilotApi,
  type TrendItem,
} from "@/lib/scriptpilot/api-client";
import { type SubscriptionPlan } from "@/lib/firebase/user-document";

const planTrendLimits: Record<Exclude<SubscriptionPlan, "studio_unlimited">, number> = {
  creator_pro: 15,
  free: 3,
};

const trendCategories = [
  { label: "All", value: "0" },
  { label: "Music", value: "10" },
  { label: "Pets & Animals", value: "15" },
  { label: "Sports", value: "17" },
  { label: "Gaming", value: "20" },
  { label: "People & Blogs", value: "22" },
  { label: "Comedy", value: "23" },
  { label: "Entertainment", value: "24" },
  { label: "News & Politics", value: "25" },
  { label: "Howto & Style", value: "26" },
  { label: "Education", value: "27" },
  { label: "Science & Technology", value: "28" },
];

const trendLocations = [
  { label: "United States", region: "US" },
  { label: "United Kingdom", region: "GB" },
  { label: "Pakistan", region: "PK" },
  { label: "India", region: "IN" },
  { label: "Canada", region: "CA" },
  { label: "Australia", region: "AU" },
  { label: "Germany", region: "DE" },
  { label: "France", region: "FR" },
  { label: "Brazil", region: "BR" },
  { label: "Japan", region: "JP" },
  { label: "Saudi Arabia", region: "SA" },
  { label: "UAE", region: "AE" },
  { label: "Turkey", region: "TR" },
  { label: "Indonesia", region: "ID" },
  { label: "Philippines", region: "PH" },
  { label: "Malaysia", region: "MY" },
  { label: "Nigeria", region: "NG" },
  { label: "Egypt", region: "EG" },
  { label: "Mexico", region: "MX" },
];

const trendTimeRanges = [
  "Last 24 hours",
  "Last 7 days",
  "Last 30 days",
  "Last 90 days",
];

export default function TrendsPage() {
  const userDocument = useCurrentUserDocument();
  const [category, setCategory] = useState("0");
  const [location, setLocation] = useState("United States");
  const [timeRange, setTimeRange] = useState("Last 24 hours");
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [quotaExceeded, setQuotaExceeded] = useState<QuotaExceededError | null>(
    null,
  );

  const quotaLabel = useMemo(
    () => buildQuotaLabel(userDocument.data, userDocument.loading),
    [userDocument.data, userDocument.loading],
  );

  async function handleFindTrends() {
    setErrorMessage("");
    setQuotaExceeded(null);
    setIsLoading(true);

    try {
      const selectedLocation =
        trendLocations.find((item) => item.label === location) ?? trendLocations[0];
      const response = await scriptPilotApi.findTrends({
        category,
        maxResults: 20,
        region: selectedLocation.region,
        timeRange,
      });

      setTrends(response.trends ?? []);
      if (response.message && !response.trends?.length) {
        setErrorMessage(response.message);
      }
    } catch (error) {
      if (error instanceof QuotaExceededError) {
        setQuotaExceeded(error);
      } else if (error instanceof ScriptPilotApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Could not load trends. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <DashboardShell
      panelTitle="Trend Discovery"
      subtitle="Virality, opportunity, and competition scores"
      title="Live Trend Discovery"
    >
      <div className="scriptpilot-section-toolbar">
        <label className="scriptpilot-compact-field">
          <span>Category</span>
          <select
            onChange={(event) => setCategory(event.target.value)}
            value={category}
          >
            {trendCategories.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="scriptpilot-compact-field">
          <span>Location</span>
          <select
            onChange={(event) => setLocation(event.target.value)}
            value={location}
          >
            {trendLocations.map((option) => (
              <option key={option.label} value={option.label}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="scriptpilot-compact-field">
          <span>Time range</span>
          <select
            onChange={(event) => setTimeRange(event.target.value)}
            value={timeRange}
          >
            {trendTimeRanges.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="scriptpilot-action-panel">
        <div>
          {WEB_QUOTA_DISPLAY_ENABLED ? (
            <div>
              <p className="scriptpilot-panel-label">Daily quota</p>
              {quotaLabel ? <p>{quotaLabel}</p> : null}
            </div>
          ) : null}
          <button
            className="scriptpilot-primary-action"
            disabled={isLoading}
            onClick={handleFindTrends}
            type="button"
          >
            {isLoading ? "Finding trends..." : "Find trends"}
          </button>
        </div>
      </div>

      {quotaExceeded ? <QuotaPrompt error={quotaExceeded} /> : null}

      {errorMessage ? (
        <p className="scriptpilot-error-panel">
          {errorMessage}
        </p>
      ) : null}

      <div className="scriptpilot-results-grid">
        {isLoading ? (
          <FeatureLoadingState
            message="Scanning live YouTube trend signals for creator opportunities."
            title="Finding trends"
          />
        ) : trends.length > 0 ? (
          trends.map((trend, index) => (
            <TrendCard index={index} key={`${trend.title}-${index}`} trend={trend} />
          ))
        ) : (
          <div className="scriptpilot-trend-card scriptpilot-empty-state">
            <h3>Ready to discover what is heating up?</h3>
            <p>
              Run a live Firebase trend scan to fill this workspace with creator
              opportunities.
            </p>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

function TrendCard({ index, trend }: { index: number; trend: TrendItem }) {
  const title = trend.title || "Untitled trend";
  const virality = scoreOrFallback(trend.virality, 88 - index * 4);
  const opportunity = scoreOrFallback(
    trend.opportunity ?? trend.score,
    78 - index * 3,
  );
  const competition = competitionLabel(trend.competition);
  const summary =
    trend.reason ||
    trend.summary ||
    trend.explanation ||
    `${title} is building steady interest for creators.`;
  const ideaHref = `/dashboard/ideas?topic=${encodeURIComponent(title)}&source=trend`;

  return (
    <article className="scriptpilot-trend-card">
      <div className="scriptpilot-trend-heading">
        <h3>{title}</h3>
        <span>{trend.momentum || "Trending"}</span>
      </div>

      <div className="scriptpilot-metric-stack">
        <MetricRow color="#aab8ff" label="Virality" value={virality} />
        <MetricRow color="#42c9f6" label="Opportunity" value={opportunity} />
        <div className="scriptpilot-metric-row">
          <span>Competition</span>
          <strong className={`scriptpilot-competition ${competition.toLowerCase()}`}>
            {competition}
          </strong>
        </div>
      </div>

      <p className="scriptpilot-trend-summary">{summary}</p>
      <div className="scriptpilot-card-actions">
        <Link className="scriptpilot-inline-action" href={ideaHref}>
          Use in Ideas
        </Link>
      </div>
    </article>
  );
}

function MetricRow({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {
  return (
    <div className="scriptpilot-metric-row">
      <span>{label}</span>
      <span className="scriptpilot-meter">
        <span
          className="block h-full rounded-full"
          style={{ backgroundColor: color, width: `${value}%` }}
        />
      </span>
      <strong>{value}</strong>
    </div>
  );
}

function QuotaPrompt({ error }: { error: QuotaExceededError }) {
  return (
    <div className="scriptpilot-upgrade-panel">
      <div>
        <h3>{error.quota.featureLabel} limit reached</h3>
        <p>
          Your {error.quota.plan} plan includes {error.quota.limit} searches per
          day.
        </p>
      </div>
      <Link className="scriptpilot-primary-action" href="/dashboard/premium-plans">
        View premium plans
      </Link>
    </div>
  );
}

function buildQuotaLabel(
  userDocument: ReturnType<typeof useCurrentUserDocument>["data"],
  loading: boolean,
) {
  if (loading) return "Checking trend searches...";

  const currentPlan = userDocument?.currentPlan ?? "free";

  if (currentPlan === "studio_unlimited") {
    return "Studio Unlimited active";
  }

  const limit = planTrendLimits[currentPlan];
  const counter = userDocument?.usage.trendDiscovery;
  const count = isSameUtcDay(counter?.lastResetDate?.toDate())
    ? counter?.count ?? 0
    : 0;
  const remaining = Math.max(limit - count, 0);

  return `${remaining} of ${limit} trend searches left today`;
}

function isSameUtcDay(date?: Date) {
  if (!date) return false;

  const now = new Date();
  return (
    date.getUTCFullYear() === now.getUTCFullYear() &&
    date.getUTCMonth() === now.getUTCMonth() &&
    date.getUTCDate() === now.getUTCDate()
  );
}

function scoreOrFallback(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(Math.round(value), 100))
    : Math.max(55, Math.min(fallback, 95));
}

function competitionLabel(value: TrendItem["competition"]) {
  if (typeof value === "string") {
    const lower = value.toLowerCase();
    if (lower === "low" || lower === "medium" || lower === "high") {
      return lower[0].toUpperCase() + lower.slice(1);
    }
  }

  if (typeof value === "number") {
    if (value >= 70) return "High";
    if (value >= 42) return "Medium";
  }

  return "Low";
}
