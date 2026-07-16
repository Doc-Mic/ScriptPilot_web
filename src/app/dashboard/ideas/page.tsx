"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import {
  ErrorPanel,
  FeatureLoadingState,
  QuotaCard,
  QuotaExceededPanel,
} from "@/components/feature-status";
import { WorkflowActionBar } from "@/components/workflow-action-bar";
import { useDailyQuota } from "@/hooks/use-daily-quota";
import { saveCurrentUserProject } from "@/lib/firebase/projects";
import {
  QuotaExceededError,
  ScriptPilotApiError,
  scriptPilotApi,
  type IdeaItem,
} from "@/lib/scriptpilot/api-client";

const ideaStyles = [
  "Energetic host",
  "Calm educator",
  "Documentary",
  "Comedic",
  "Minimal / ASMR",
];

export default function IdeasPage() {
  return (
    <Suspense>
      <IdeasPageContent />
    </Suspense>
  );
}

function IdeasPageContent() {
  const searchParams = useSearchParams();
  const quota = useDailyQuota("ideaGeneration", "idea generations");
  const [topicDraft, setTopicDraft] = useState<string | null>(null);
  const [style, setStyle] = useState(ideaStyles[0]);
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [quotaExceeded, setQuotaExceeded] = useState<QuotaExceededError | null>(
    null,
  );
  const topic = topicDraft ?? searchParams.get("topic") ?? "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setQuotaExceeded(null);

    if (!topic.trim()) {
      setErrorMessage("Enter a topic before generating ideas.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await scriptPilotApi.generateIdeas({
        style,
        topic: topic.trim(),
      });

      const nextIdeas = response.ideas?.length ? response.ideas : response.data ?? [];
      setIdeas(nextIdeas);
      if (response.error) setErrorMessage(response.error);
      if (!nextIdeas.length && !response.error) {
        setErrorMessage("No ideas came back. Try a more specific topic.");
      }
    } catch (error) {
      if (error instanceof QuotaExceededError) {
        setQuotaExceeded(error);
      } else if (error instanceof ScriptPilotApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Could not generate ideas. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <DashboardShell
      panelTitle="Idea Generator"
      subtitle="Hooks, angles, audiences, and formats"
      title="Generated Video Ideas"
    >
      <div className="scriptpilot-feature-layout">
        <form className="scriptpilot-form-card" onSubmit={handleSubmit}>
          <QuotaCard
            action="Generate ideas"
            isLoading={isLoading}
            label={quota.label}
          />

          <label className="scriptpilot-field">
            <span>Topic</span>
            <textarea
              onChange={(event) => setTopicDraft(event.target.value)}
              placeholder="e.g. AI tools for students"
              rows={5}
              value={topic}
            />
          </label>

          <label className="scriptpilot-field">
            <span>Style</span>
            <select
              onChange={(event) => setStyle(event.target.value)}
              value={style}
            >
              {ideaStyles.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <button
            className="scriptpilot-primary-action"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? "Generating ideas..." : "Generate ideas"}
          </button>
        </form>

        <section className="scriptpilot-result-panel">
          <div className="scriptpilot-result-heading">
            <p className="scriptpilot-eyebrow">Generated ideas</p>
            <h3>{ideas.length ? `${ideas.length} ideas ready` : "No ideas yet"}</h3>
          </div>

          <QuotaExceededPanel error={quotaExceeded} />
          <ErrorPanel message={errorMessage} />
          {isLoading ? (
            <FeatureLoadingState
              message="Generating angles, hooks, audiences, and formats from your topic."
              title="Generating ideas"
            />
          ) : null}

          <div className="scriptpilot-idea-grid">
            {!isLoading && ideas.length ? (
              ideas.map((idea, index) => (
                <article className="scriptpilot-idea-card" key={`${idea.title}-${index}`}>
                  <span>Idea {index + 1}</span>
                  <h4>{idea.title || "Untitled idea"}</h4>
                  {idea.hook ? <p>{idea.hook}</p> : null}
                  <dl>
                    {idea.angle ? (
                      <>
                        <dt>Angle</dt>
                        <dd>{idea.angle}</dd>
                      </>
                    ) : null}
                    {idea.targetAudience ? (
                      <>
                        <dt>Audience</dt>
                        <dd>{idea.targetAudience}</dd>
                      </>
                    ) : null}
                    {idea.format ? (
                      <>
                        <dt>Format</dt>
                        <dd>{idea.format}</dd>
                      </>
                    ) : null}
                  </dl>
                  <div className="scriptpilot-card-actions">
                    <Link
                      className="scriptpilot-inline-action"
                      href={`/dashboard/script-studio?idea=${encodeURIComponent(
                        buildScriptIdea(idea),
                      )}`}
                    >
                      Use in Script Studio
                    </Link>
                  </div>
                  <WorkflowActionBar
                    copyText={formatIdeaForSharing(idea)}
                    onFeedback={() => undefined}
                    onSave={() => saveIdeaProject(idea)}
                    shareTitle={idea.title || "ScriptPilot idea"}
                  />
                </article>
              ))
            ) : !isLoading ? (
              <div className="scriptpilot-empty-state">
                <h3>Generate from your topic</h3>
                <p>
                  Add a topic and style to receive four distinct YouTube idea
                  cards with hooks, angles, audiences, and formats.
                </p>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}

function buildScriptIdea(idea: IdeaItem) {
  return [
    idea.title ? `Title: ${idea.title}` : "",
    idea.hook ? `Hook: ${idea.hook}` : "",
    idea.angle ? `Angle: ${idea.angle}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function formatIdeaForSharing(idea: IdeaItem) {
  return [
    idea.title ? `Title: ${idea.title}` : "",
    idea.hook ? `Hook: ${idea.hook}` : "",
    idea.angle ? `Angle: ${idea.angle}` : "",
    idea.targetAudience ? `Audience: ${idea.targetAudience}` : "",
    idea.format ? `Format: ${idea.format}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

async function saveIdeaProject(idea: IdeaItem) {
  await saveCurrentUserProject({
    content: formatIdeaForSharing(idea),
    title: idea.title || "Video idea",
    type: "idea",
  });

  return "Idea saved to My Projects.";
}
