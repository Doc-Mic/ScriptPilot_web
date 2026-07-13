"use client";

import { type FirestoreError } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  subscribeToCurrentUserProjectCount,
  subscribeToCurrentUserProjects,
  type SavedProject,
} from "@/lib/firebase/projects";

type ProjectsState = {
  error: FirestoreError | null;
  loading: boolean;
  projects: SavedProject[];
  uid: string | null;
};

type ProjectCountState = {
  count: number;
  error: FirestoreError | null;
  loading: boolean;
  uid: string | null;
};

export function useSavedProjects() {
  const { loading: authLoading, user } = useAuth();
  const [state, setState] = useState<ProjectsState>({
    error: null,
    loading: true,
    projects: [],
    uid: null,
  });

  useEffect(() => {
    if (authLoading || !user) return;

    return subscribeToCurrentUserProjects(
      user.uid,
      (projects) => {
        setState({
          error: null,
          loading: false,
          projects,
          uid: user.uid,
        });
      },
      (error) => {
        setState({
          error,
          loading: false,
          projects: [],
          uid: user.uid,
        });
      },
    );
  }, [authLoading, user]);

  if (authLoading) {
    return { error: null, loading: true, projects: [] };
  }

  if (!user) {
    return { error: null, loading: false, projects: [] };
  }

  return {
    error: state.uid === user.uid ? state.error : null,
    loading: state.uid !== user.uid || state.loading,
    projects: state.uid === user.uid ? state.projects : [],
  };
}

export function useSavedProjectCount() {
  const { loading: authLoading, user } = useAuth();
  const [state, setState] = useState<ProjectCountState>({
    count: 0,
    error: null,
    loading: true,
    uid: null,
  });

  useEffect(() => {
    if (authLoading || !user) return;

    return subscribeToCurrentUserProjectCount(
      user.uid,
      (count) => {
        setState({
          count,
          error: null,
          loading: false,
          uid: user.uid,
        });
      },
      (error) => {
        setState({
          count: 0,
          error,
          loading: false,
          uid: user.uid,
        });
      },
    );
  }, [authLoading, user]);

  if (authLoading) {
    return { count: 0, error: null, loading: true };
  }

  if (!user) {
    return { count: 0, error: null, loading: false };
  }

  return {
    count: state.uid === user.uid ? state.count : 0,
    error: state.uid === user.uid ? state.error : null,
    loading: state.uid !== user.uid || state.loading,
  };
}
