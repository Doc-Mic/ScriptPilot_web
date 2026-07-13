"use client";

import { useState, type FormEvent } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import {
  ErrorPanel,
  FeatureLoadingState,
  QuotaCard,
  QuotaExceededPanel,
} from "@/components/feature-status";
import { WorkflowActionBar } from "@/components/workflow-action-bar";
import { useDailyQuota } from "@/hooks/use-daily-quota";
import {
  QuotaExceededError,
  ScriptPilotApiError,
  scriptPilotApi,
} from "@/lib/scriptpilot/api-client";

export default function ShortsPage() {
  const quota = useDailyQuota("scriptGeneration", "scripts/shorts");
  const [topic, setTopic] = useState("");
  const [script, setScript] = useState("");
  const [savedScript, setSavedScript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [quotaExceeded, setQuotaExceeded] = useState<QuotaExceededError | null>(
    null,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setQuotaExceeded(null);

    if (!topic.trim()) {
      setErrorMessage("Enter a Shorts topic before generating.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await scriptPilotApi.createShort({
        topic: topic.trim(),
      });

      const legacy = response.data
        ? [response.data.hook, response.data.body, response.data.cta]
            .filter(Boolean)
            .join("\n\n")
        : "";
      const nextScript = response.script || legacy;
      setScript(nextScript);
      setSavedScript("");
      if (response.error) setErrorMessage(response.error);
      if (!nextScript && !response.error) {
        setErrorMessage("No short script came back. Try a sharper topic.");
      }
    } catch (error) {
      if (error instanceof QuotaExceededError) {
        setQuotaExceeded(error);
      } else if (error instanceof ScriptPilotApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Could not generate a Shorts script. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleSaveChanges() {
    setSavedScript(script);
  }

  return (
    <DashboardShell
      panelTitle="Shorts"
      subtitle="Punchy short-form scripts in seconds"
      title="Shorts Mode"
    >
      <div className="scriptpilot-feature-layout">
        <form className="scriptpilot-form-card" onSubmit={handleSubmit}>
          <QuotaCard
            action="Generate shorts script"
            isLoading={isLoading}
            label={quota.label}
          />

          <label className="scriptpilot-field">
            <span>Topic</span>
            <input
              onChange={(event) => setTopic(event.target.value)}
              placeholder="Enter Shorts topic"
              value={topic}
            />
          </label>

          <button
            className="scriptpilot-primary-action"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? "Generating short..." : "Generate shorts script"}
          </button>
        </form>

        <section className="scriptpilot-result-panel">
          <div className="scriptpilot-result-heading">
            <p className="scriptpilot-eyebrow">Short-form output</p>
            <h3>{script ? "Script ready" : "No short yet"}</h3>
          </div>

          <QuotaExceededPanel error={quotaExceeded} />
          <ErrorPanel message={errorMessage} />
          {isLoading ? (
            <FeatureLoadingState
              message="Building a punchy short-form hook, body, and call to action."
              title="Generating short"
            />
          ) : null}

          {!isLoading && script ? (
            <>
              <article className="scriptpilot-short-output">
                {script.split(/\n{2,}/).map((block, index) => (
                  <p key={`${block}-${index}`}>{block}</p>
                ))}
              </article>
              <WorkflowActionBar
                copyText={script}
                onFeedback={() => undefined}
                onSave={handleSaveChanges}
                shareTitle="ScriptPilot Shorts script"
              />
              {savedScript === script ? (
                <p className="scriptpilot-local-save-note">Short saved locally.</p>
              ) : null}
            </>
          ) : !isLoading ? (
            <div className="scriptpilot-empty-state">
              <h3>Create a 60-second idea</h3>
              <p>
                Enter a focused Shorts topic to generate a fast hook, short body,
                and call to action.
              </p>
            </div>
          ) : null}
        </section>
      </div>
    </DashboardShell>
  );
}
