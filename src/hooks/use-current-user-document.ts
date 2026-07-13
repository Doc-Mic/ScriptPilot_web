"use client";

import { type FirestoreError } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  subscribeToUserDocument,
  type ScriptPilotUserDocument,
} from "@/lib/firebase/user-document";

export type CurrentUserDocumentState = {
  data: ScriptPilotUserDocument | null;
  error: FirestoreError | null;
  exists: boolean;
  loading: boolean;
};

type SubscriptionState = Omit<CurrentUserDocumentState, "loading"> & {
  uid: string | null;
};

export function useCurrentUserDocument(): CurrentUserDocumentState {
  const { loading: authLoading, user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    data: null,
    error: null,
    exists: false,
    uid: null,
  });

  useEffect(() => {
    if (authLoading || !user) return;

    return subscribeToUserDocument(
      user.uid,
      ({ exists, user: userDocument }) => {
        setState({
          data: userDocument,
          error: null,
          exists,
          uid: user.uid,
        });
      },
      (error) => {
        setState({
          data: null,
          error,
          exists: false,
          uid: user.uid,
        });
      },
    );
  }, [authLoading, user]);

  if (authLoading) {
    return {
      data: null,
      error: null,
      exists: false,
      loading: true,
    };
  }

  if (!user) {
    return {
      data: null,
      error: null,
      exists: false,
      loading: false,
    };
  }

  return {
    data: state.uid === user.uid ? state.data : null,
    error: state.uid === user.uid ? state.error : null,
    exists: state.uid === user.uid ? state.exists : false,
    loading: state.uid !== user.uid,
  };
}
