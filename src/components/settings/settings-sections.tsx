"use client";

import {
  ChevronRight,
  FileText,
  LogOut,
  Mail,
  RotateCcw,
  Share2,
  Shield,
  Star,
  X,
} from "lucide-react";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { saveCurrentUserPreferences } from "@/lib/firebase/preferences";
import { useCurrentUserDocument } from "@/hooks/use-current-user-document";

export const APP_VERSION = "1.5";

const SETTINGS_KEYS = {
  autoSaveProjects: "scriptpilot:auto-save-projects",
  defaultTone: "scriptpilot:default-script-tone",
  theme: "scriptpilot:theme",
  weeklyTips: "scriptpilot:weekly-creator-tips",
};

const toneOptions = [
  "Friendly",
  "Confident",
  "Authoritative",
  "Playful",
  "Inspirational",
];

type ModalContent = {
  body: string[];
  title: string;
};

export function SettingsNavCard({
  href,
  icon,
  subtitle,
  title,
}: {
  href: string;
  icon?: ReactNode;
  subtitle: string;
  title: string;
}) {
  return (
    <Link
      className={`scriptpilot-settings-nav-card ${icon ? "" : "no-icon"}`}
      href={href}
    >
      {icon ? <span className="scriptpilot-settings-card-icon">{icon}</span> : null}
      <span>
        <strong>{title}</strong>
        <em>{subtitle}</em>
      </span>
      <ChevronRight size={22} />
    </Link>
  );
}

export function PreferencesPanel() {
  const userDocument = useCurrentUserDocument();
  const cachedTheme = useStoredStringPreference(SETTINGS_KEYS.theme, "Dark");
  const cachedDefaultTone = useStoredStringPreference(
    SETTINGS_KEYS.defaultTone,
    "Friendly",
  );
  const cachedAutoSaveProjects = useStoredBooleanPreference(
    SETTINGS_KEYS.autoSaveProjects,
    false,
  );
  const weeklyTips = useStoredBooleanPreference(SETTINGS_KEYS.weeklyTips, false);
  const [pushEnabled, setPushEnabled] = useState(
    () => getNotificationPermissionSnapshot() === "granted",
  );
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission | "unsupported">(
      getNotificationPermissionSnapshot,
    );
  const [statusMessage, setStatusMessage] = useState("");
  const preferences = userDocument.data?.preferences;
  const theme = preferences?.theme ?? cachedTheme;
  const defaultTone = preferences?.defaultScriptTone ?? cachedDefaultTone;
  const autoSaveProjects =
    preferences?.autoSaveProjects ?? cachedAutoSaveProjects;

  useEffect(() => {
    if (!preferences) return;

    writePreference(SETTINGS_KEYS.theme, preferences.theme);
    writePreference(SETTINGS_KEYS.defaultTone, preferences.defaultScriptTone);
    writePreference(
      SETTINGS_KEYS.autoSaveProjects,
      String(preferences.autoSaveProjects),
    );
    document.documentElement.dataset.theme = preferences.theme.toLowerCase();
  }, [preferences]);

  async function savePreferences(
    patch: Parameters<typeof saveCurrentUserPreferences>[0],
    successMessage: string,
  ) {
    await saveCurrentUserPreferences(patch, {
      createIfMissing: !userDocument.exists,
    });
    setStatusMessage(successMessage);
  }

  function updateTheme(nextTheme: string) {
    const themePreference = nextTheme === "System" ? "System" : "Dark";
    writePreference(SETTINGS_KEYS.theme, nextTheme);
    document.documentElement.dataset.theme = nextTheme.toLowerCase();
    void savePreferences(
      { theme: themePreference },
      "Theme preference saved.",
    ).catch((error) =>
      setStatusMessage(error instanceof Error ? error.message : "Could not save theme."),
    );
  }

  function updateDefaultTone(nextTone: string) {
    writePreference(SETTINGS_KEYS.defaultTone, nextTone);
    void savePreferences(
      { defaultScriptTone: nextTone },
      "Default script tone saved.",
    ).catch((error) =>
      setStatusMessage(
        error instanceof Error ? error.message : "Could not save default tone.",
      ),
    );
  }

  function updateAutoSave(enabled: boolean) {
    writePreference(SETTINGS_KEYS.autoSaveProjects, String(enabled));
    void savePreferences(
      { autoSaveProjects: enabled },
      enabled ? "Auto-save preference enabled." : "Auto-save preference disabled.",
    ).catch((error) =>
      setStatusMessage(
        error instanceof Error ? error.message : "Could not save auto-save preference.",
      ),
    );
  }

  async function requestNotifications() {
    if (!("Notification" in window)) {
      setNotificationPermission("unsupported");
      setStatusMessage("Notifications are not supported in this browser.");
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    setPushEnabled(permission === "granted");

    if (permission !== "granted") {
      writePreference(SETTINGS_KEYS.weeklyTips, "false");
    }

    setStatusMessage(
      permission === "granted"
        ? "Push notifications are enabled."
        : "Notifications are disabled in browser settings.",
    );
  }

  function toggleWeeklyTips(enabled: boolean) {
    writePreference(SETTINGS_KEYS.weeklyTips, String(enabled));
    setStatusMessage(enabled ? "Weekly creator tips enabled." : "Weekly creator tips disabled.");
  }

  function resetPreferences() {
    writePreference(SETTINGS_KEYS.theme, "Dark");
    writePreference(SETTINGS_KEYS.defaultTone, "Friendly");
    writePreference(SETTINGS_KEYS.autoSaveProjects, "false");
    writePreference(SETTINGS_KEYS.weeklyTips, "false");
    void savePreferences(
      {
        autoSaveProjects: false,
        defaultScriptTone: "Friendly",
        theme: "Dark",
      },
      "Preferences reset.",
    ).catch((error) =>
      setStatusMessage(
        error instanceof Error ? error.message : "Could not reset preferences.",
      ),
    );
  }

  return (
    <div className="scriptpilot-settings-page">
      <section className="scriptpilot-settings-section">
        <h2>Appearance</h2>
        <div className="scriptpilot-settings-controls">
          <label className="scriptpilot-floating-select">
            <span>Theme</span>
            <select onChange={(event) => updateTheme(event.target.value)} value={theme}>
              <option>Dark</option>
              <option>System</option>
            </select>
          </label>
        </div>
      </section>

      <section className="scriptpilot-settings-section">
        <h2>Preferences</h2>
        <div className="scriptpilot-settings-controls">
          <label className="scriptpilot-floating-select">
            <span>Default script tone</span>
            <select
              onChange={(event) => updateDefaultTone(event.target.value)}
              value={defaultTone}
            >
              {toneOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>

          <ToggleRow
            checked={autoSaveProjects}
            label="Auto-save projects"
            onChange={updateAutoSave}
          />

          <button
            className="scriptpilot-reset-preferences"
            onClick={resetPreferences}
            type="button"
          >
            <RotateCcw size={18} />
            Reset preferences
          </button>
        </div>
      </section>

      <section className="scriptpilot-settings-section">
        <h2>Notifications</h2>
        <div className="scriptpilot-settings-controls">
          <ToggleRow
            checked={pushEnabled}
            disabled={notificationPermission === "unsupported"}
            label="Push notifications"
            onChange={(enabled) => {
              if (enabled) {
                void requestNotifications();
                return;
              }

              setPushEnabled(false);
              writePreference(SETTINGS_KEYS.weeklyTips, "false");
              setStatusMessage("Push notifications disabled.");
            }}
          />

          <p className="scriptpilot-settings-muted">
            {notificationPermission === "granted"
              ? "Notifications are enabled for this browser."
              : notificationPermission === "unsupported"
                ? "Notifications are not supported in this browser."
                : "Notifications are disabled in browser settings."}
          </p>

          {notificationPermission !== "granted" ? (
            <button
              className="scriptpilot-text-action"
              onClick={requestNotifications}
              type="button"
            >
              Open Settings
            </button>
          ) : null}

          <ToggleRow
            checked={weeklyTips}
            disabled={!pushEnabled}
            label="Weekly creator tips"
            onChange={toggleWeeklyTips}
          />
        </div>
      </section>

      {statusMessage ? (
        <p className="scriptpilot-settings-toast">{statusMessage}</p>
      ) : null}
    </div>
  );
}

function useStoredStringPreference(key: string, fallback: string) {
  return useSyncExternalStore(
    subscribeToPreferenceChanges,
    () => readStringPreference(key, fallback),
    () => fallback,
  );
}

function useStoredBooleanPreference(key: string, fallback: boolean) {
  return useStoredStringPreference(key, String(fallback)) === "true";
}

function subscribeToPreferenceChanges(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("scriptpilot-preferences-change", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("scriptpilot-preferences-change", onStoreChange);
  };
}

function readStringPreference(key: string, fallback: string) {
  return localStorage.getItem(key) ?? fallback;
}

function writePreference(key: string, value: string) {
  localStorage.setItem(key, value);
  window.dispatchEvent(new Event("scriptpilot-preferences-change"));
}

function getNotificationPermissionSnapshot(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  return Notification.permission;
}

export function SupportLegalPanel() {
  const [statusMessage, setStatusMessage] = useState("");
  const [modal, setModal] = useState<ModalContent | null>(null);

  async function handleShareApp() {
    const shareText = "Try ScriptPilot, an AI co-pilot for YouTube creators.";
    const url = window.location.origin;

    if (navigator.share) {
      await navigator.share({
        text: shareText,
        title: "ScriptPilot",
        url,
      });
      return;
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(`${shareText} ${url}`);
      setStatusMessage("Share link copied.");
      return;
    }

    setStatusMessage("Sharing is not available in this browser.");
  }

  return (
    <>
      <div className="scriptpilot-settings-page">
        <section className="scriptpilot-settings-section">
          <div className="scriptpilot-settings-list">
            <ActionCard
              icon={<Shield size={26} />}
              onClick={() => setModal(privacyModal)}
              subtitle="Learn how your data is handled."
              title="Privacy Policy"
            />
            <ActionCard
              icon={<FileText size={26} />}
              onClick={() => setModal(termsModal)}
              subtitle="Read app terms and usage policies."
              title="Terms & Conditions"
            />
            <ActionCard
              icon={<Mail size={26} />}
              onClick={() => {
                window.location.href =
                  "mailto:support@scriptpilot.app?subject=ScriptPilot%20Support";
              }}
              subtitle="Get help or send feedback."
              title="Contact Us"
            />
            <ActionCard
              icon={<Star size={26} />}
              onClick={() => {
                window.open(
                  "https://play.google.com/store/apps/details?id=com.mic.scriptpilot",
                  "_blank",
                  "noopener,noreferrer",
                );
              }}
              subtitle="Rate us on Google Play."
              title="Rate ScriptPilot"
            />
            <ActionCard
              icon={<Share2 size={26} />}
              onClick={() => void handleShareApp()}
              subtitle="Invite friends to ScriptPilot."
              title="Share App"
            />
          </div>
        </section>

        <footer className="scriptpilot-settings-footer">
          <p>Version {APP_VERSION}</p>
          <p>© 2026 ScriptPilot. All rights reserved.</p>
        </footer>

        {statusMessage ? (
          <p className="scriptpilot-settings-toast">{statusMessage}</p>
        ) : null}
      </div>

      {modal ? <InfoModal modal={modal} onClose={() => setModal(null)} /> : null}
    </>
  );
}

export function AboutPanel() {
  return (
    <div className="scriptpilot-settings-page">
      <section className="scriptpilot-about-hero">
        <h3>ScriptPilot</h3>
        <p>AI co-pilot for YouTube creators.</p>
        <span>Version {APP_VERSION}</span>
      </section>

      <InfoCard title="What is ScriptPilot?">
        ScriptPilot helps creators plan, write, and optimize content from one clean
        workspace. It supports trend discovery, video ideas, script generation,
        Shorts content, SEO titles, descriptions, tags, and saved creator projects.
      </InfoCard>

      <InfoCard title="Key Features">
        - Discover trending content ideas
        <br />
        - Generate video ideas from any topic
        <br />
        - Write editable YouTube scripts
        <br />
        - Create Shorts scripts quickly
        <br />
        - Generate SEO titles, descriptions, and tags
        <br />- Save and manage creator projects
      </InfoCard>

      <InfoCard title="Built For">
        YouTube creators, students, educators, tech creators, storytellers, and anyone
        who wants to create content faster with AI support.
      </InfoCard>

      <InfoCard title="Disclaimer">
        Generated content should be reviewed and edited by the creator before publishing.
        ScriptPilot is not affiliated with YouTube, Google, or any third-party platform.
      </InfoCard>

      <footer className="scriptpilot-settings-footer">
        <strong>Developed by Muhammad Irfan Cheema</strong>
        <span>Software Engineer</span>
        <p>© 2026 ScriptPilot. All rights reserved.</p>
      </footer>
    </div>
  );
}

export function SettingsLogoutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleLogout() {
    setIsSigningOut(true);
    await signOut(getFirebaseAuth());
    router.replace("/login");
  }

  return (
    <button
      className="scriptpilot-settings-logout-button"
      disabled={isSigningOut}
      onClick={handleLogout}
      type="button"
    >
      <LogOut size={18} />
      {isSigningOut ? "Logging out..." : "Logout"}
    </button>
  );
}

function ToggleRow({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className={`scriptpilot-toggle-row ${disabled ? "disabled" : ""}`}>
      <span>{label}</span>
      <input
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      <em aria-hidden="true" />
    </label>
  );
}

function ActionCard({
  icon,
  onClick,
  subtitle,
  title,
}: {
  icon: ReactNode;
  onClick: () => void;
  subtitle: string;
  title: string;
}) {
  return (
    <button className="scriptpilot-support-card" onClick={onClick} type="button">
      <span className="scriptpilot-support-icon">{icon}</span>
      <span>
        <strong>{title}</strong>
        <em>{subtitle}</em>
      </span>
      <ChevronRight size={22} />
    </button>
  );
}

function InfoCard({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <article className="scriptpilot-about-card">
      <h3>{title}</h3>
      <p>{children}</p>
    </article>
  );
}

function InfoModal({
  modal,
  onClose,
}: {
  modal: ModalContent;
  onClose: () => void;
}) {
  return (
    <div className="scriptpilot-modal-backdrop" role="presentation">
      <section
        aria-labelledby="settings-modal-title"
        aria-modal="true"
        className="scriptpilot-upgrade-modal scriptpilot-info-modal"
        role="dialog"
      >
        <button
          aria-label="Close dialog"
          className="scriptpilot-modal-close"
          onClick={onClose}
          type="button"
        >
          <X size={18} />
        </button>
        <h2 id="settings-modal-title">{modal.title}</h2>
        {modal.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>
    </div>
  );
}

const privacyModal = {
  title: "Privacy Policy",
  body: [
    "ScriptPilot uses Firebase Authentication to identify your account and connect your web workspace to the same backend as the Android app.",
    "Creator prompts and generated outputs are sent only to ScriptPilot's Firebase Functions so AI features can respond. Do not paste private credentials or sensitive personal data into prompts.",
    "Web billing and project storage are not enabled yet. Preferences on this page are stored locally in your browser.",
  ],
};

const termsModal = {
  title: "Terms & Conditions",
  body: [
    "ScriptPilot provides AI-assisted creator tools for planning, drafting, and optimizing content. Generated content should be reviewed by you before publishing.",
    "You are responsible for checking facts, platform policy compliance, copyright, and final creative decisions.",
    "Web payments are launching soon. Paid upgrades should currently be managed through the Android app.",
  ],
};
