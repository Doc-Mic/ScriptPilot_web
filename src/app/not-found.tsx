import Link from "next/link";

export default function NotFound() {
  return (
    <main className="scriptpilot-not-found-screen">
      <section className="scriptpilot-not-found-card">
        <p className="scriptpilot-eyebrow">404</p>
        <h1>Page not found</h1>
        <p>
          This workspace route does not exist, or the link may have moved.
          Head back to ScriptPilot and keep creating.
        </p>
        <div>
          <Link className="button-primary" href="/dashboard">
            Go to dashboard
          </Link>
          <Link className="button-secondary" href="/">
            Back home
          </Link>
        </div>
      </section>
    </main>
  );
}
