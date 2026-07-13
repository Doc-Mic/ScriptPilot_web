"use client";

import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getFirebaseAuth, getGoogleProvider } from "@/lib/firebase/client";

type AuthMode = "sign-in" | "sign-up";

const authErrorMessages: Record<string, string> = {
  "auth/account-exists-with-different-credential":
    "An account already exists for this email with a different sign-in method.",
  "auth/email-already-in-use":
    "That email is already registered. Try signing in instead.",
  "auth/invalid-credential":
    "The email or password is incorrect. Please check and try again.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/operation-not-allowed":
    "This sign-in method is not enabled for this Firebase project yet.",
  "auth/popup-blocked": "The Google sign-in popup was blocked by the browser.",
  "auth/popup-closed-by-user": "Google sign-in was closed before it finished.",
  "auth/too-many-requests":
    "Too many attempts. Please wait a moment before trying again.",
  "auth/user-not-found": "No account was found for that email address.",
  "auth/weak-password": "Use a stronger password with at least 6 characters.",
  "auth/wrong-password": "The password is incorrect.",
};

function getAuthErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    return (
      authErrorMessages[error.code] ??
      "Authentication failed. Please try again."
    );
  }

  return "Authentication failed. Please try again.";
}

export default function LoginPage() {
  const router = useRouter();
  const { isConfigured, loading, user } = useAuth();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignUp = mode === "sign-up";

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, router, user]);

  async function handleEmailAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!isConfigured) {
      setErrorMessage(
        "Firebase is not configured yet. Fill in .env.local before signing in.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const auth = getFirebaseAuth();

      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      router.replace("/dashboard");
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setErrorMessage("");

    if (!isConfigured) {
      setErrorMessage(
        "Firebase is not configured yet. Fill in .env.local before signing in.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await signInWithPopup(getFirebaseAuth(), getGoogleProvider());
      router.replace("/dashboard");
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="marketing-screen">
      <section className="marketing-shell">
        <div className="marketing-hero">
          <Link className="marketing-logo-lockup" href="/">
            <Image
              alt="ScriptPilot logo"
              height={54}
              src="/scriptpilot-logo.png"
              width={54}
            />
            <span className="scriptpilot-eyebrow">ScriptPilot</span>
          </Link>
          <h1>Sign in to your creator workspace.</h1>
          <p>
            Access the same ScriptPilot account system used by the Android app,
            with email/password or Google sign-in.
          </p>
        </div>

        <div className="auth-card">
          <div className="auth-toggle">
            <button
              className={!isSignUp ? "active" : ""}
              onClick={() => {
                setMode("sign-in");
                setErrorMessage("");
              }}
              type="button"
            >
              Sign in
            </button>
            <button
              className={isSignUp ? "active" : ""}
              onClick={() => {
                setMode("sign-up");
                setErrorMessage("");
              }}
              type="button"
            >
              Sign up
            </button>
          </div>

          <form className="auth-form" onSubmit={handleEmailAuth}>
            <div>
              <label
                htmlFor="email"
              >
                Email
              </label>
              <input
                autoComplete="email"
                id="email"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </div>

            <div>
              <label
                htmlFor="password"
              >
                Password
              </label>
              <input
                autoComplete={isSignUp ? "new-password" : "current-password"}
                id="password"
                minLength={6}
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </div>

            {errorMessage ? (
              <p className="auth-error">
                {errorMessage}
              </p>
            ) : null}

            <button
              className="button-primary w-full disabled:cursor-not-allowed"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting
                ? "Please wait..."
                : isSignUp
                  ? "Create account"
                  : "Sign in"}
            </button>
          </form>

          <div className="auth-divider">or</div>

          <button
            className="button-secondary w-full disabled:cursor-not-allowed"
            disabled={isSubmitting}
            onClick={handleGoogleSignIn}
            type="button"
          >
            Continue with Google
          </button>
        </div>
      </section>
    </main>
  );
}
