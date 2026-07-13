"use client";

import { useMemo } from "react";
import { useCurrentUserDocument } from "@/hooks/use-current-user-document";
import { type SubscriptionPlan, type UsageFeature } from "@/lib/firebase/user-document";

type LimitedPlan = Exclude<SubscriptionPlan, "studio_unlimited">;

const dailyLimits: Record<LimitedPlan, Record<UsageFeature, number>> = {
  creator_pro: {
    ideaGeneration: 10,
    scriptGeneration: 15,
    seoPackage: 15,
    trendDiscovery: 15,
  },
  free: {
    ideaGeneration: 2,
    scriptGeneration: 2,
    seoPackage: 1,
    trendDiscovery: 3,
  },
};

export function useDailyQuota(feature: UsageFeature, unitLabel: string) {
  const userDocument = useCurrentUserDocument();

  const label = useMemo(() => {
    if (userDocument.loading) return `Checking ${unitLabel} quota...`;

    const currentPlan = userDocument.data?.currentPlan ?? "free";

    if (currentPlan === "studio_unlimited") {
      return "Studio Unlimited active";
    }

    const limit = dailyLimits[currentPlan][feature];
    const counter = userDocument.data?.usage[feature];
    const count = isSameUtcDay(counter?.lastResetDate?.toDate())
      ? counter?.count ?? 0
      : 0;
    const remaining = Math.max(limit - count, 0);

    return `${remaining} of ${limit} ${unitLabel} left today`;
  }, [feature, unitLabel, userDocument.data, userDocument.loading]);

  return {
    label,
    loading: userDocument.loading,
    userDocument: userDocument.data,
  };
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
