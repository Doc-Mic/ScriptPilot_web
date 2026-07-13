"use client";

import { Copy } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState, type FormEvent } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import {
  ErrorPanel,
  FeatureLoadingState,
  QuotaCard,
  QuotaExceededPanel,
} from "@/components/feature-status";
import {
  copyTextToClipboard,
  WorkflowActionBar,
} from "@/components/workflow-action-bar";
import { useDailyQuota } from "@/hooks/use-daily-quota";
import {
  QuotaExceededError,
  ScriptPilotApiError,
  scriptPilotApi,
  type SeoAssistantResponse,
} from "@/lib/scriptpilot/api-client";
import { saveCurrentUserProject } from "@/lib/firebase/projects";

const contentTypeOptions = [
  "YouTube",
  "Shorts",
  "Tutorial",
  "Documentary",
  "Gaming",
  "Education",
  "Tech",
];

type SeoTab = "titles" | "descriptions" | "tags";
type NormalizedSeoPackage = {
  descriptions: string[];
  tags: string[];
  titles: string[];
};

export default function SeoAssistantPage() {
  return (
    <Suspense>
      <SeoAssistantPageContent />
    </Suspense>
  );
}

function SeoAssistantPageContent() {
  const searchParams = useSearchParams();
  const [initialHandoff] = useState(() => readInitialSeoHandoff(searchParams));
  const quota = useDailyQuota("seoPackage", "SEO packages");
  const [scriptDraft, setScriptDraft] = useState(initialHandoff.scriptDraft);
  const [topicHint, setTopicHint] = useState("");
  const [workingTitle, setWorkingTitle] = useState(initialHandoff.workingTitle);
  const [contentTypes, setContentTypes] = useState<string[]>(["YouTube"]);
  const [activeTab, setActiveTab] = useState<SeoTab>("titles");
  const [seoPackage, setSeoPackage] = useState<SeoAssistantResponse | null>(null);
  const [savedSeoPackage, setSavedSeoPackage] =
    useState<NormalizedSeoPackage | null>(null);
  const [tagCopyMessage, setTagCopyMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [quotaExceeded, setQuotaExceeded] = useState<QuotaExceededError | null>(
    null,
  );

  const normalized = useMemo(() => normalizeSeoPackage(seoPackage), [seoPackage]);
  const hasSeoResults = Boolean(
    normalized.titles.length ||
      normalized.descriptions.length ||
      normalized.tags.length,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setQuotaExceeded(null);
    setTagCopyMessage("");

    if (!scriptDraft.trim() && !topicHint.trim() && !workingTitle.trim()) {
      setErrorMessage("Paste a script, topic, or working title first.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await scriptPilotApi.seoAssistant({
        contentTypes,
        scriptDraft: scriptDraft.trim(),
        topicHint: topicHint.trim(),
        workingTitle: workingTitle.trim(),
      });

      setSeoPackage(response);
      setSavedSeoPackage(null);
      if (response.error) setErrorMessage(response.error);
      const next = normalizeSeoPackage(response);
      if (!next.titles.length && !next.descriptions.length && !next.tags.length && !response.error) {
        setErrorMessage("No SEO package came back. Try adding more context.");
      }
    } catch (error) {
      if (error instanceof QuotaExceededError) {
        setQuotaExceeded(error);
      } else if (error instanceof ScriptPilotApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Could not generate an SEO package. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  function toggleContentType(option: string) {
    setContentTypes((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option],
    );
  }

  async function handleSaveSeoPackage() {
    const content = formatSeoPackageForSharing(normalized);
    await saveCurrentUserProject({
      content,
      title: normalized.titles[0] || workingTitle || "SEO package",
      type: "seo",
    });
    setSavedSeoPackage(normalized);
    return "SEO package saved to My Projects.";
  }

  async function handleCopyTags() {
    if (!normalized.tags.length) return;

    await copyTextToClipboard(normalized.tags.join(", "));
    setTagCopyMessage("Tags copied.");
  }

  return (
    <DashboardShell
      panelTitle="SEO Assistant"
      subtitle="Titles, descriptions, and tags powered by AI"
      title="SEO Assistant"
    >
      <div className="scriptpilot-feature-layout">
        <form className="scriptpilot-form-card" onSubmit={handleSubmit}>
          <QuotaCard
            action="Generate SEO pack"
            isLoading={isLoading}
            label={quota.label}
          />

          <label className="scriptpilot-field">
            <span>Script or topic</span>
            <textarea
              onChange={(event) => setScriptDraft(event.target.value)}
              placeholder="Paste script or topic"
              rows={5}
              value={scriptDraft}
            />
          </label>

          <label className="scriptpilot-field">
            <span>Working title</span>
            <input
              onChange={(event) => setWorkingTitle(event.target.value)}
              placeholder="Optional video title"
              value={workingTitle}
            />
          </label>

          <label className="scriptpilot-field">
            <span>Content context</span>
            <textarea
              onChange={(event) => setTopicHint(event.target.value)}
              placeholder="e.g. AI, productivity, finance, tech"
              rows={3}
              value={topicHint}
            />
          </label>

          <div className="scriptpilot-field">
            <span>Creator tool</span>
            <div className="scriptpilot-chip-row">
              {contentTypeOptions.map((option) => (
                <button
                  className={contentTypes.includes(option) ? "active" : ""}
                  key={option}
                  onClick={() => toggleContentType(option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <button
            className="scriptpilot-primary-action"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? "Generating SEO pack..." : "Generate SEO pack"}
          </button>
        </form>

        <section className="scriptpilot-result-panel">
          <div className="scriptpilot-result-heading">
            <p className="scriptpilot-eyebrow">SEO package</p>
            <h3>
              {normalized.titles.length || normalized.descriptions.length || normalized.tags.length
                ? "Package ready"
                : "No package yet"}
            </h3>
          </div>

          <QuotaExceededPanel error={quotaExceeded} />
          <ErrorPanel message={errorMessage} />
          {isLoading ? (
            <FeatureLoadingState
              message="Preparing title options, descriptions, and searchable tags."
              title="Generating SEO package"
            />
          ) : null}

          {!isLoading ? (
            <div className="scriptpilot-tab-list" role="tablist" aria-label="SEO result tabs">
            <button
              className={activeTab === "titles" ? "active" : ""}
              onClick={() => setActiveTab("titles")}
              type="button"
            >
              Titles ({normalized.titles.length})
            </button>
            <button
              className={activeTab === "descriptions" ? "active" : ""}
              onClick={() => setActiveTab("descriptions")}
              type="button"
            >
              Descriptions ({normalized.descriptions.length})
            </button>
            <button
              className={activeTab === "tags" ? "active" : ""}
              onClick={() => setActiveTab("tags")}
              type="button"
            >
              Tags ({normalized.tags.length})
            </button>
            </div>
          ) : null}

          {!isLoading ? (
            <SeoTabPanel
              activeTab={activeTab}
              onCopyTags={handleCopyTags}
              packageData={normalized}
              tagCopyMessage={tagCopyMessage}
            />
          ) : null}

          {!isLoading && hasSeoResults ? (
            <WorkflowActionBar
              copyText={formatSeoPackageForSharing(normalized)}
              onFeedback={() => undefined}
              onSave={handleSaveSeoPackage}
              shareTitle="ScriptPilot SEO package"
            />
          ) : null}
          {savedSeoPackage ? (
            <p className="scriptpilot-local-save-note">SEO package saved locally.</p>
          ) : null}
        </section>
      </div>
    </DashboardShell>
  );
}

function readInitialSeoHandoff(searchParams: ReturnType<typeof useSearchParams>) {
  const isScriptStudioHandoff = searchParams.get("source") === "script-studio";
  const storedScript =
    typeof window !== "undefined" && isScriptStudioHandoff
      ? sessionStorage.getItem("scriptpilot:seo-script-draft")
      : "";
  const storedTitle =
    typeof window !== "undefined" && isScriptStudioHandoff
      ? sessionStorage.getItem("scriptpilot:seo-working-title")
      : "";

  return {
    scriptDraft: searchParams.get("scriptDraft") || storedScript || "",
    workingTitle: searchParams.get("workingTitle") || storedTitle || "",
  };
}

function SeoTabPanel({
  activeTab,
  onCopyTags,
  packageData,
  tagCopyMessage,
}: {
  activeTab: SeoTab;
  onCopyTags: () => void;
  packageData: NormalizedSeoPackage;
  tagCopyMessage: string;
}) {
  if (!packageData.titles.length && !packageData.descriptions.length && !packageData.tags.length) {
    return (
      <div className="scriptpilot-empty-state">
        <h3>Paste a topic or script</h3>
        <p>
          Generate searchable YouTube packaging with title options, one long SEO
          description, and discovery tags.
        </p>
      </div>
    );
  }

  if (activeTab === "descriptions") {
    return (
      <div className="scriptpilot-seo-list">
        {packageData.descriptions.map((description, index) => (
          <article className="scriptpilot-seo-card description" key={`${description}-${index}`}>
            <span>Description {index + 1}</span>
            <p>{description}</p>
          </article>
        ))}
      </div>
    );
  }

  if (activeTab === "tags") {
    return (
      <div className="scriptpilot-tag-section">
        <div className="scriptpilot-tag-toolbar">
          <button
            className="scriptpilot-copy-tags-action"
            onClick={onCopyTags}
            type="button"
          >
            <Copy aria-hidden="true" size={16} />
            Copy all tags
          </button>
          {tagCopyMessage ? <span>{tagCopyMessage}</span> : null}
        </div>
        <div className="scriptpilot-tag-cloud">
          {packageData.tags.map((tag, index) => (
            <span key={`${tag}-${index}`}>{tag}</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="scriptpilot-seo-list">
      {packageData.titles.map((title, index) => (
        <article className="scriptpilot-seo-card" key={`${title}-${index}`}>
          <span>Title {index + 1}</span>
          <p>{title}</p>
        </article>
      ))}
    </div>
  );
}

function normalizeSeoPackage(
  response: SeoAssistantResponse | null,
): NormalizedSeoPackage {
  if (!response) {
    return { descriptions: [], tags: [], titles: [] };
  }

  const legacy = response.data;
  const descriptions = [
    ...(response.descriptions ?? []),
    ...(response.description ? [response.description] : []),
    ...(legacy?.descriptions ?? []),
    ...(legacy?.description ? [legacy.description] : []),
  ].filter(Boolean);

  return {
    descriptions,
    tags: response.tags?.length ? response.tags : legacy?.tags ?? [],
    titles: response.titles?.length ? response.titles : legacy?.titles ?? [],
  };
}

function formatSeoPackageForSharing(packageData: NormalizedSeoPackage) {
  const sections = [
    packageData.titles.length
      ? `Titles\n${packageData.titles.map((title, index) => `${index + 1}. ${title}`).join("\n")}`
      : "",
    packageData.descriptions.length
      ? `Descriptions\n${packageData.descriptions
          .map((description, index) => `${index + 1}. ${description}`)
          .join("\n\n")}`
      : "",
    packageData.tags.length ? `Tags\n${packageData.tags.join(", ")}` : "",
  ].filter(Boolean);

  return sections.join("\n\n");
}
