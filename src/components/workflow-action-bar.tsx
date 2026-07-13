"use client";

import { Copy, Save, Share2, ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";

type FeedbackValue = "up" | "down";

export function WorkflowActionBar({
  copyLabel = "Copy",
  copyText,
  disabled = false,
  onFeedback,
  onSave,
  saveLabel = "Save",
  shareTitle,
}: {
  copyLabel?: string;
  copyText: string;
  disabled?: boolean;
  onFeedback?: (value: FeedbackValue) => void;
  onSave: () => Promise<string | void> | string | void;
  saveLabel?: string;
  shareTitle: string;
}) {
  const [feedback, setFeedback] = useState<FeedbackValue | null>(null);
  const [status, setStatus] = useState("");

  async function handleCopy() {
    if (!copyText.trim()) return;
    await copyTextToClipboard(copyText);
    setStatus("Copied.");
  }

  async function handleSave() {
    try {
      const message = await onSave();
      setStatus(message || "Saved.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save.");
    }
  }

  function handleFeedback(value: FeedbackValue) {
    setFeedback(value);
    onFeedback?.(value);
    setStatus("Feedback noted.");
  }

  async function handleShare() {
    if (!copyText.trim()) return;

    if (navigator.share) {
      try {
        await navigator.share({
          text: copyText,
          title: shareTitle,
        });
        setStatus("Shared.");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    await copyTextToClipboard(copyText);
    setStatus("Copied share text.");
  }

  return (
    <div className="scriptpilot-workflow-actions">
      <button disabled={disabled} onClick={handleCopy} type="button">
        <Copy aria-hidden="true" size={16} />
        {copyLabel}
      </button>
      <button disabled={disabled} onClick={handleSave} type="button">
        <Save aria-hidden="true" size={16} />
        {saveLabel}
      </button>
      <div className="scriptpilot-feedback-actions" aria-label="Feedback">
        <button
          aria-pressed={feedback === "up"}
          className={feedback === "up" ? "active" : ""}
          disabled={disabled}
          onClick={() => handleFeedback("up")}
          title="Helpful"
          type="button"
        >
          <ThumbsUp aria-hidden="true" size={16} />
        </button>
        <button
          aria-pressed={feedback === "down"}
          className={feedback === "down" ? "active" : ""}
          disabled={disabled}
          onClick={() => handleFeedback("down")}
          title="Needs work"
          type="button"
        >
          <ThumbsDown aria-hidden="true" size={16} />
        </button>
      </div>
      <button disabled={disabled} onClick={handleShare} type="button">
        <Share2 aria-hidden="true" size={16} />
        Share
      </button>
      {status ? <span>{status}</span> : null}
    </div>
  );
}

export async function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}
