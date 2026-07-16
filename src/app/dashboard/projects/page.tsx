"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { ErrorPanel, FeatureLoadingState } from "@/components/feature-status";
import { useSavedProjects } from "@/hooks/use-saved-projects";
import {
  deleteCurrentUserProject,
  type SavedProject,
} from "@/lib/firebase/projects";

export default function ProjectsPage() {
  const { error, loading, projects } = useSavedProjects();
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const activeProject =
    projects.find((project) => project.id === activeProjectId) ?? projects[0] ?? null;

  async function handleDeleteProject(project: SavedProject) {
    const confirmed = window.confirm(
      `Delete "${project.title}"? This cannot be undone.`,
    );

    if (!confirmed) return;

    setDeleteError("");
    setDeletingProjectId(project.id);

    try {
      await deleteCurrentUserProject(project.id);
      if (activeProjectId === project.id) {
        setActiveProjectId(null);
      }
    } catch {
      setDeleteError("Could not delete the project. Please try again.");
    } finally {
      setDeletingProjectId(null);
    }
  }

  return (
    <DashboardShell
      panelTitle="My Projects"
      subtitle="Saved scripts and SEO packages"
      title="My Projects"
    >
      <div className="scriptpilot-projects-layout">
        <section className="scriptpilot-projects-list">
          <div className="scriptpilot-result-heading">
            <p className="scriptpilot-eyebrow">Saved work</p>
            <h3>{projects.length ? `${projects.length} projects` : "No projects yet"}</h3>
          </div>

          {loading ? (
            <FeatureLoadingState
              message="Loading your saved creator work."
              title="Loading projects"
            />
          ) : null}
          <ErrorPanel
            message={
              deleteError ||
              (error ? "Could not load saved projects. Please try again." : "")
            }
          />

          {!loading && projects.length ? (
            <div className="scriptpilot-project-card-list">
              {projects.map((project) => (
                <article
                  className={project.id === activeProject?.id ? "active" : ""}
                  key={project.id}
                >
                  <button
                    className="scriptpilot-project-select"
                    onClick={() => setActiveProjectId(project.id)}
                    type="button"
                  >
                    <span>{projectTypeLabel(project.type)}</span>
                    <strong>{project.title}</strong>
                    <em>{formatProjectDate(project.updatedAt?.toDate())}</em>
                  </button>
                  <button
                    aria-label={`Delete ${project.title}`}
                    className="scriptpilot-project-delete"
                    disabled={deletingProjectId === project.id}
                    onClick={() => void handleDeleteProject(project)}
                    type="button"
                  >
                    <Trash2 aria-hidden="true" size={17} />
                  </button>
                </article>
              ))}
            </div>
          ) : null}

          {!loading && !projects.length ? (
            <div className="scriptpilot-empty-state">
              <h3>No saved projects yet</h3>
              <p>
                Save a generated script or SEO package to build your project
                library here.
              </p>
            </div>
          ) : null}
        </section>

        <section className="scriptpilot-project-detail">
          {activeProject ? (
            <ProjectDetail project={activeProject} />
          ) : (
            <div className="scriptpilot-empty-state">
              <h3>Select a project</h3>
              <p>Your saved content will appear here for review.</p>
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}

function ProjectDetail({ project }: { project: SavedProject }) {
  return (
    <article className="scriptpilot-project-content">
      <div>
        <p className="scriptpilot-eyebrow">{projectTypeLabel(project.type)}</p>
        <h3>{project.title}</h3>
        <span>{formatProjectDate(project.updatedAt?.toDate())}</span>
      </div>
      <pre>{project.content}</pre>
    </article>
  );
}

function projectTypeLabel(type: SavedProject["type"]) {
  if (type === "seo") return "SEO";
  if (type === "idea") return "Idea";
  if (type === "short") return "Short";
  if (type === "trend") return "Trend";
  return "Script";
}

function formatProjectDate(date?: Date) {
  if (!date) return "Just now";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
