"use client";

import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  type FirestoreError,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseAuth, getFirebaseFirestore } from "@/lib/firebase/client";

export type SavedProjectType = "idea" | "script" | "seo";

export type SavedProject = {
  content: string;
  createdAt: Timestamp | null;
  id: string;
  title: string;
  type: SavedProjectType;
  updatedAt: Timestamp | null;
};

export type SaveProjectInput = {
  content: string;
  title: string;
  type: SavedProjectType;
};

export async function saveCurrentUserProject(input: SaveProjectInput) {
  const user = getFirebaseAuth().currentUser;

  if (!user) {
    throw new Error("Sign in is required before saving projects.");
  }

  const title = input.title.trim() || fallbackProjectTitle(input.type);
  const content = input.content.trim();

  if (!content) {
    throw new Error("There is no project content to save yet.");
  }

  const projectsRef = collection(
    getFirebaseFirestore(),
    "users",
    user.uid,
    "projects",
  );

  return addDoc(projectsRef, {
    content,
    createdAt: serverTimestamp(),
    title,
    type: input.type,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToCurrentUserProjects(
  uid: string,
  onChange: (projects: SavedProject[]) => void,
  onError?: (error: FirestoreError) => void,
): Unsubscribe {
  const projectsQuery = query(
    collection(getFirebaseFirestore(), "users", uid, "projects"),
    orderBy("updatedAt", "desc"),
  );

  return onSnapshot(
    projectsQuery,
    (snapshot) => {
      onChange(
        snapshot.docs.map((doc) => parseProject(doc.id, doc.data())),
      );
    },
    onError,
  );
}

export function subscribeToCurrentUserProjectCount(
  uid: string,
  onChange: (count: number) => void,
  onError?: (error: FirestoreError) => void,
): Unsubscribe {
  return subscribeToCurrentUserProjects(
    uid,
    (projects) => onChange(projects.length),
    onError,
  );
}

function parseProject(id: string, data: Record<string, unknown>): SavedProject {
  return {
    content: typeof data.content === "string" ? data.content : "",
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt : null,
    id,
    title: typeof data.title === "string" ? data.title : "Untitled project",
    type: parseProjectType(data.type),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : null,
  };
}

function parseProjectType(value: unknown): SavedProjectType {
  return value === "idea" || value === "script" || value === "seo"
    ? value
    : "script";
}

function fallbackProjectTitle(type: SavedProjectType) {
  if (type === "seo") return "SEO package";
  if (type === "idea") return "Video idea";
  return "Script";
}
