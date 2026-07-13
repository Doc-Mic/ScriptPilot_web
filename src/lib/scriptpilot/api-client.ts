import { type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";

export type ScriptPilotFunctionName =
  | "findTrends"
  | "generateIdeas"
  | "createScript"
  | "createShort"
  | "seoAssistant";

export type QuotaExceeded = {
  feature: string;
  featureLabel: string;
  plan: string;
  limit: number;
  nextPlan: string | null;
};

export class QuotaExceededError extends Error {
  readonly quota: QuotaExceeded;
  readonly status = 429;

  constructor(quota: QuotaExceeded) {
    super(`${quota.featureLabel} limit reached for ${quota.plan}.`);
    this.name = "QuotaExceededError";
    this.quota = quota;
  }
}

export class ScriptPilotApiError extends Error {
  readonly code: string | null;
  readonly payload: unknown;
  readonly status: number;

  constructor(message: string, status: number, code: string | null, payload: unknown) {
    super(message);
    this.name = "ScriptPilotApiError";
    this.code = code;
    this.payload = payload;
    this.status = status;
  }
}

export type FindTrendsRequest = {
  category?: string;
  region?: string;
  timeRange?: string;
  maxResults?: number;
};

export type TrendItem = {
  title?: string;
  category?: string;
  region?: string;
  score?: number;
  source?: string;
  channel?: string;
  reason?: string;
  summary?: string;
  explanation?: string;
  thumbnail?: string;
  publishedAt?: string;
  virality?: number;
  competition?: number | string;
  opportunity?: number;
  momentum?: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  rank?: number;
};

export type IdeaItem = {
  title?: string;
  hook?: string;
  angle?: string;
  targetAudience?: string;
  format?: string;
};

export type CreateScriptPayload = {
  title?: string;
  hook?: string;
  intro?: string;
  body?: string;
  outro?: string;
  cta?: string;
  duration?: string;
  tone?: string;
  targetWords?: number;
  wordCount?: number;
  sections?: Array<{
    heading?: string;
    content?: string;
  }>;
};

export type SeoLegacyBlock = {
  titles?: string[];
  descriptions?: string[];
  description?: string;
  tags?: string[];
};

export type GenerateIdeasRequest = {
  topic: string;
  style: string;
};

export type CreateScriptRequest = {
  idea: string;
  durationLabel: string;
  tone: string;
};

export type CreateShortRequest = {
  topic: string;
};

export type SeoAssistantRequest = {
  scriptDraft: string;
  workingTitle?: string;
  topicHint: string;
  contentTypes?: string[];
};

export type FindTrendsResponse = {
  trends: TrendItem[];
  message?: string;
};

export type GenerateIdeasResponse = {
  ideas: IdeaItem[];
  data?: IdeaItem[];
  error?: string;
};

export type CreateScriptResponse = {
  script: CreateScriptPayload | null;
  data?: CreateScriptPayload | null;
  error?: string;
};

export type CreateShortResponse = {
  script: string | null;
  data?: {
    hook?: string;
    body?: string;
    cta?: string;
  } | null;
  error?: string;
};

export type SeoAssistantResponse = {
  titles: string[];
  descriptions: string[];
  description?: string;
  tags: string[];
  data?: SeoLegacyBlock;
  error?: string;
};

const functionsBaseUrl =
  "https://us-central1-scriptpilot-d0e9a.cloudfunctions.net";

export const scriptPilotApi = {
  findTrends(request: FindTrendsRequest = {}) {
    return callScriptPilotFunction<FindTrendsResponse>("findTrends", {
      method: "GET",
      query: {
        category: request.category,
        region: request.region ?? "US",
        timeRange: request.timeRange,
        maxResults: request.maxResults ?? 20,
      },
    });
  },

  generateIdeas(request: GenerateIdeasRequest) {
    return callScriptPilotFunction<GenerateIdeasResponse>("generateIdeas", {
      body: request,
      method: "POST",
    });
  },

  createScript(request: CreateScriptRequest) {
    return callScriptPilotFunction<CreateScriptResponse>("createScript", {
      body: request,
      method: "POST",
    });
  },

  createShort(request: CreateShortRequest) {
    return callScriptPilotFunction<CreateShortResponse>("createShort", {
      body: request,
      method: "POST",
    });
  },

  seoAssistant(request: SeoAssistantRequest) {
    return callScriptPilotFunction<SeoAssistantResponse>("seoAssistant", {
      body: request,
      method: "POST",
    });
  },
};

type CallOptions = {
  body?: unknown;
  method: "GET" | "POST";
  query?: Record<string, string | number | null | undefined>;
};

export async function callScriptPilotFunction<ResponseBody>(
  functionName: ScriptPilotFunctionName,
  options: CallOptions,
): Promise<ResponseBody> {
  const user = getFirebaseAuth().currentUser;

  if (!user) {
    throw new ScriptPilotApiError("Sign in is required.", 401, "unauthenticated", null);
  }

  const token = await getIdToken(user);
  const url = buildFunctionUrl(functionName, options.query);
  const requestBody =
    options.method === "POST" ? JSON.stringify(options.body ?? {}) : undefined;
  const response = await fetch(url, {
    body: requestBody,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Content-Type": "application/json",
      Pragma: "no-cache",
      "X-ScriptPilot-Client": "web",
    },
    method: options.method,
  });

  const payload = await readJsonPayload(response);

  if (!response.ok) {
    throw parseApiError(response.status, payload);
  }

  return payload as ResponseBody;
}

async function getIdToken(user: User) {
  const token = await user.getIdToken(false);

  if (!token) {
    throw new ScriptPilotApiError(
      "Could not read the Firebase sign-in token.",
      401,
      "unauthenticated",
      null,
    );
  }

  return token;
}

function buildFunctionUrl(
  functionName: ScriptPilotFunctionName,
  query?: Record<string, string | number | null | undefined>,
) {
  const url = new URL(`${functionsBaseUrl}/${functionName}`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

async function readJsonPayload(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function parseApiError(status: number, payload: unknown) {
  const error = extractErrorPayload(payload);

  if (status === 429 && error?.code === "quota-exceeded") {
    return new QuotaExceededError({
      feature: asString(error.feature),
      featureLabel: asString(error.featureLabel) || asString(error.feature),
      plan: asString(error.plan) || "free",
      limit: asNumber(error.limit),
      nextPlan: asOptionalString(error.nextPlan),
    });
  }

  return new ScriptPilotApiError(
    asString(error?.message) || "ScriptPilot request failed. Please try again.",
    status,
    asOptionalString(error?.code),
    payload,
  );
}

function extractErrorPayload(payload: unknown) {
  if (!isRecord(payload)) {
    return null;
  }

  return isRecord(payload.error) ? payload.error : payload;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asOptionalString(value: unknown) {
  const text = asString(value);
  return text || null;
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
