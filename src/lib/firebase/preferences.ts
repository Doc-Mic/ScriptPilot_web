"use client";

import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseFirestore } from "@/lib/firebase/client";
import { type UserPreferences } from "@/lib/firebase/user-document";

export type UserPreferencePatch = Partial<UserPreferences>;

export async function saveCurrentUserPreferences(
  patch: UserPreferencePatch,
  options: { createIfMissing?: boolean } = {},
) {
  const user = getFirebaseAuth().currentUser;

  if (!user) {
    throw new Error("Sign in is required before saving preferences.");
  }

  const payload = options.createIfMissing
    ? {
        currentPlan: "free",
        planExpiryDate: null,
        preferences: patch,
        updatedAt: serverTimestamp(),
      }
    : {
        preferences: patch,
        updatedAt: serverTimestamp(),
      };

  await setDoc(doc(getFirebaseFirestore(), "users", user.uid), payload, {
    merge: true,
  });
}
