"use client";

import { Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useMemo,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import {
  ErrorPanel,
  FeatureLoadingState,
  QuotaCard,
  QuotaExceededPanel,
} from "@/components/feature-status";
import { WorkflowActionBar } from "@/components/workflow-action-bar";
import { useDailyQuota } from "@/hooks/use-daily-quota";
import { useCurrentUserDocument } from "@/hooks/use-current-user-document";
import {
  QuotaExceededError,
  ScriptPilotApiError,
  scriptPilotApi,
  type CreateScriptPayload,
} from "@/lib/scriptpilot/api-client";
import { saveCurrentUserProject } from "@/lib/firebase/projects";

const durationOptions = ["3 min", "5 min", "10 min", "15 min", "Custom"];
const toneOptions = [
  "Confident",
  "Friendly",
  "Authoritative",
  "Playful",
  "Inspirational",
];

export default function ScriptStudioPage() {
  return (
    <Suspense>
      <ScriptStudioPageContent />
    </Suspense>
  );
}

function ScriptStudioPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quota = useDailyQuota("scriptGeneration", "scripts/shorts");
  const userDocument = useCurrentUserDocument();
  const cachedDefaultTone = useDefaultScriptTone();
  const defaultTone =
    userDocument.data?.preferences.defaultScriptTone ?? cachedDefaultTone;
  const [ideaDraft, setIdeaDraft] = useState<string | null>(null);
  const [duration, setDuration] = useState("3 min");
  const [customMinutes, setCustomMinutes] = useState("20");
  const [toneDraft, setToneDraft] = useState<string | null>(null);
  const [script, setScript] = useState<CreateScriptPayload | null>(null);
  const [scriptText, setScriptText] = useState("");
  const [savedScriptText, setSavedScriptText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [quotaExceeded, setQuotaExceeded] = useState<QuotaExceededError | null>(
    null,
  );

  const durationLabel = useMemo(
    () => (duration === "Custom" ? `${customMinutes || 5} min` : duration),
    [customMinutes, duration],
  );
  const idea = ideaDraft ?? searchParams.get("idea") ?? "";
  const tone = toneDraft ?? defaultTone;

  async function handleSaveChanges() {
    await saveCurrentUserProject({
      content: scriptText,
      title: script?.title || firstLine(scriptText) || "Script",
      type: "script",
    });
    setSavedScriptText(scriptText);
    return "Script saved to My Projects.";
  }

  function handleGenerateSeoPack() {
    const draft = scriptText.trim();
    if (!draft) return;

    sessionStorage.setItem("scriptpilot:seo-script-draft", draft);
    sessionStorage.setItem("scriptpilot:seo-working-title", script?.title || "");
    router.push("/dashboard/seo-assistant?source=script-studio");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setQuotaExceeded(null);

    if (!idea.trim()) {
      setErrorMessage("Enter a video idea before generating a script.");
      return;
    }

    if (duration === "Custom") {
      const minutes = Number(customMinutes);
      if (!Number.isFinite(minutes) || minutes < 1 || minutes > 180) {
        setErrorMessage("Enter a custom duration between 1 and 180 minutes.");
        return;
      }
    }

    setIsLoading(true);

    try {
      const response = await scriptPilotApi.createScript({
        durationLabel,
        idea: idea.trim(),
        tone,
      });

      const nextScript = response.script ?? response.data ?? null;
      setScript(nextScript);
      const nextScriptText = nextScript ? createScriptText(nextScript) : "";
      setScriptText(nextScriptText);
      setSavedScriptText("");
      if (response.error) setErrorMessage(response.error);
      if (!nextScript && !response.error) {
        setErrorMessage("No script came back. Try a more specific idea.");
      }
    } catch (error) {
      if (error instanceof QuotaExceededError) {
        setQuotaExceeded(error);
      } else if (error instanceof ScriptPilotApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Could not generate the script. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <DashboardShell
      panelTitle="Script Studio"
      subtitle="Long-form scripts with clear sections"
      title="Script Studio"
    >
      <div className="scriptpilot-feature-layout">
        <form className="scriptpilot-form-card" onSubmit={handleSubmit}>
          <QuotaCard
            action="Generate script"
            isLoading={isLoading}
            label={quota.label}
          />

          <label className="scriptpilot-field">
            <span>Idea</span>
            <textarea
              onChange={(event) => setIdeaDraft(event.target.value)}
              placeholder="Paste your video idea"
              rows={5}
              value={idea}
            />
          </label>

          <div className="scriptpilot-field">
            <span>Duration</span>
            <div className="scriptpilot-chip-row">
              {durationOptions.map((option) => (
                <button
                  className={duration === option ? "active" : ""}
                  key={option}
                  onClick={() => setDuration(option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {duration === "Custom" ? (
            <label className="scriptpilot-field">
              <span>Custom duration minutes</span>
              <input
                max={180}
                min={1}
                onChange={(event) => setCustomMinutes(event.target.value)}
                type="number"
                value={customMinutes}
              />
            </label>
          ) : null}

          <label className="scriptpilot-field">
            <span>Tone</span>
            <select onChange={(event) => setToneDraft(event.target.value)} value={tone}>
              {toneOptions.map((option) => (
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
            {isLoading ? "Generating script..." : "Generate script"}
          </button>
        </form>

        <section className="scriptpilot-result-panel">
          <div className="scriptpilot-result-heading">
            <p className="scriptpilot-eyebrow">Generated script</p>
            <h3>{script?.title || "Script output"}</h3>
          </div>

          <QuotaExceededPanel error={quotaExceeded} />
          <ErrorPanel message={errorMessage} />
          {isLoading ? (
            <FeatureLoadingState
              message="Drafting a complete script with a hook, body, outro, and CTA."
              title="Generating script"
            />
          ) : null}

          {!isLoading && script ? (
            <>
              <ScriptOutput
                onChange={setScriptText}
                script={script}
                scriptText={scriptText}
              />
              <button
                className="scriptpilot-seo-handoff-button"
                disabled={!scriptText.trim()}
                onClick={handleGenerateSeoPack}
                type="button"
              >
                <Sparkles aria-hidden="true" size={18} />
                Generate SEO Pack
              </button>
              <WorkflowActionBar
                copyText={scriptText}
                onFeedback={() => undefined}
                onSave={handleSaveChanges}
                shareTitle={script.title || "ScriptPilot script"}
              />
              {savedScriptText === scriptText ? (
                <p className="scriptpilot-local-save-note">Script saved locally.</p>
              ) : null}
            </>
          ) : !isLoading ? (
            <div className="scriptpilot-empty-state">
              <h3>Write a complete long-form script</h3>
              <p>
                Add an idea, choose a duration and tone, then generate a
                production-ready script with hook, intro, body, outro, and CTA.
              </p>
            </div>
          ) : null}
        </section>
      </div>
    </DashboardShell>
  );
}

function firstLine(text: string) {
  return text.split("\n").find((line) => line.trim())?.trim() ?? "";
}

function useDefaultScriptTone() {
  return useSyncExternalStore(
    subscribeToStoredTone,
    getStoredToneSnapshot,
    () => "Friendly",
  );
}

function subscribeToStoredTone(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("scriptpilot-preferences-change", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("scriptpilot-preferences-change", onStoreChange);
  };
}

function getStoredToneSnapshot() {
  const savedTone = localStorage.getItem("scriptpilot:default-script-tone");

  return savedTone && toneOptions.includes(savedTone) ? savedTone : "Friendly";
}

function createScriptText(script: CreateScriptPayload) {
  if (script.sections?.length) {
    return script.sections
      .map((section) => [section.heading, section.content].filter(Boolean).join("\n"))
      .filter(Boolean)
      .join("\n\n");
  }

  return [script.hook, script.intro, script.body, script.outro, script.cta]
    .filter(Boolean)
    .join("\n\n");
}

function ScriptOutput({
  onChange,
  script,
  scriptText,
}: {
  onChange: (value: string) => void;
  script: CreateScriptPayload;
  scriptText: string;
}) {
  return (
    <article className="scriptpilot-script-output">
      <div className="scriptpilot-output-meta">
        {script.duration ? <span>{script.duration}</span> : null}
        {script.tone ? <span>{script.tone}</span> : null}
        {script.wordCount ? <span>{script.wordCount} words</span> : null}
      </div>

      <textarea
        aria-label="Generated script"
        className="scriptpilot-full-script-editor"
        onChange={(event) => onChange(event.target.value)}
        value={scriptText}
      />
    </article>
  );
}
