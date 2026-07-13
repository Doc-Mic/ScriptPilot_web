import {
  doc,
  onSnapshot,
  Timestamp,
  type FirestoreError,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseFirestore } from "./client";

export type SubscriptionPlan = "free" | "creator_pro" | "studio_unlimited";

export type UsageFeature =
  | "trendDiscovery"
  | "ideaGeneration"
  | "scriptGeneration"
  | "seoPackage";

export type UsageCounter = {
  count: number;
  lastResetDate: Timestamp | null;
};

export type UserUsage = Record<UsageFeature, UsageCounter>;

export type UserPreferences = {
  autoSaveProjects: boolean;
  defaultScriptTone: string;
  theme: "Dark" | "System";
};

export type ScriptPilotUserDocument = {
  currentPlan: SubscriptionPlan;
  planExpiryDate: Timestamp | null;
  preferences: UserPreferences;
  usage: UserUsage;
};

export type UserDocumentSnapshotState = {
  exists: boolean;
  user: ScriptPilotUserDocument | null;
};

export const usageFeatures = [
  "trendDiscovery",
  "ideaGeneration",
  "scriptGeneration",
  "seoPackage",
] as const satisfies readonly UsageFeature[];

const validPlans = new Set<SubscriptionPlan>([
  "free",
  "creator_pro",
  "studio_unlimited",
]);

const emptyCounter: UsageCounter = {
  count: 0,
  lastResetDate: null,
};

const defaultPreferences: UserPreferences = {
  autoSaveProjects: false,
  defaultScriptTone: "Friendly",
  theme: "Dark",
};

export function subscribeToUserDocument(
  uid: string,
  onChange: (state: UserDocumentSnapshotState) => void,
  onError?: (error: FirestoreError) => void,
): Unsubscribe {
  return onSnapshot(
    doc(getFirebaseFirestore(), "users", uid),
    (snapshot) => {
      if (!snapshot.exists()) {
        onChange({ exists: false, user: null });
        return;
      }

      onChange({
        exists: true,
        user: parseUserDocument(snapshot.data()),
      });
    },
    onError,
  );
}

function parseUserDocument(data: Record<string, unknown>): ScriptPilotUserDocument {
  return {
    currentPlan: parsePlan(data.currentPlan),
    planExpiryDate: parseTimestamp(data.planExpiryDate),
    preferences: parsePreferences(data.preferences),
    usage: parseUsage(data.usage),
  };
}

function parsePlan(value: unknown): SubscriptionPlan {
  return typeof value === "string" && validPlans.has(value as SubscriptionPlan)
    ? (value as SubscriptionPlan)
    : "free";
}

function parseUsage(value: unknown): UserUsage {
  const rawUsage = isRecord(value) ? value : {};

  return usageFeatures.reduce((usage, feature) => {
    const counter = rawUsage[feature];
    usage[feature] = parseUsageCounter(counter);
    return usage;
  }, {} as UserUsage);
}

function parseUsageCounter(value: unknown): UsageCounter {
  if (!isRecord(value)) {
    return emptyCounter;
  }

  return {
    count: typeof value.count === "number" ? value.count : 0,
    lastResetDate: parseTimestamp(value.lastResetDate),
  };
}

function parsePreferences(value: unknown): UserPreferences {
  if (!isRecord(value)) {
    return defaultPreferences;
  }

  return {
    autoSaveProjects:
      typeof value.autoSaveProjects === "boolean"
        ? value.autoSaveProjects
        : defaultPreferences.autoSaveProjects,
    defaultScriptTone:
      typeof value.defaultScriptTone === "string" && value.defaultScriptTone
        ? value.defaultScriptTone
        : defaultPreferences.defaultScriptTone,
    theme: value.theme === "System" ? "System" : "Dark",
  };
}

function parseTimestamp(value: unknown): Timestamp | null {
  return value instanceof Timestamp ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
