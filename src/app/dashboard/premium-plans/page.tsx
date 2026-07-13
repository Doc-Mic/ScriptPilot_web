"use client";

import { Check, Crown, Mail, Sparkles, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { useCurrentUserDocument } from "@/hooks/use-current-user-document";
import { type SubscriptionPlan } from "@/lib/firebase/user-document";

type Plan = {
  badge?: string;
  id: SubscriptionPlan;
  name: string;
  price: string;
  subtitle: string;
  features: string[];
  limits: {
    ideas: string;
    scripts: string;
    seo: string;
    trends: string;
  };
};

const plans: Plan[] = [
  {
    id: "free",
    name: "Free Plan",
    price: "$0",
    subtitle: "Start creating with basic AI tools",
    features: [
      "Limited daily generations",
      "Basic trend discovery",
      "Basic video ideas",
      "Basic script generation",
      "No advanced SEO",
    ],
    limits: {
      ideas: "2 / day",
      scripts: "2 / day",
      seo: "1 / day",
      trends: "3 / day",
    },
  },
  {
    id: "creator_pro",
    name: "Creator Pro",
    price: "$4.99 / month",
    subtitle: "For creators who publish consistently",
    features: [
      "Create faster with more daily generations",
      "Plan better videos with advanced idea generation",
      "Write longer scripts with stronger pacing",
      "Turn ideas into Shorts scripts",
      "Publish with confidence using SEO assistant",
      "Save more creator projects",
      "Priority generation for busy publishing weeks",
    ],
    limits: {
      ideas: "10 / day",
      scripts: "15 / day",
      seo: "15 / day",
      trends: "15 / day",
    },
  },
  {
    badge: "Most Powerful",
    id: "studio_unlimited",
    name: "Studio Unlimited",
    price: "$14.99 / month",
    subtitle: "Unlimited power for serious creators",
    features: [
      "Remove creative limits with unlimited generations",
      "Use stronger AI models for deeper work",
      "Grow reach with advanced SEO suggestions",
      "Move faster with premium script templates",
      "Build complete long-form script workflows",
      "Keep unlimited saved projects",
      "Get faster priority responses",
      "Try new creator tools early",
    ],
    limits: {
      ideas: "Unlimited",
      scripts: "Unlimited",
      seo: "Unlimited",
      trends: "Unlimited",
    },
  },
];

const comparisonRows = [
  { key: "trends", label: "Trend discovery" },
  { key: "ideas", label: "Idea generation" },
  { key: "scripts", label: "Scripts + Shorts" },
  { key: "seo", label: "SEO packages" },
] as const;

export default function PremiumPlansPage() {
  const { data, loading } = useCurrentUserDocument();
  const currentPlan = data?.currentPlan ?? "free";
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  return (
    <DashboardShell
      subtitle="Plans for every creator workflow"
      title="Premium Plans"
    >
      <div className="scriptpilot-premium-page">
        <section className="scriptpilot-plan-grid">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlan && !loading;

            return (
              <article
                className={`scriptpilot-plan-card ${plan.badge ? "featured" : ""}`}
                key={plan.id}
              >
                {plan.badge ? (
                  <span className="scriptpilot-plan-badge">{plan.badge}</span>
                ) : null}

                <div>
                  <h2>{plan.name}</h2>
                  <p className="scriptpilot-plan-price">{plan.price}</p>
                  <p className="scriptpilot-plan-subtitle">{plan.subtitle}</p>
                </div>

                <div className="scriptpilot-plan-perks">
                  {plan.features.map((feature) => (
                    <p key={feature}>
                      <Check size={18} strokeWidth={2.5} />
                      {feature}
                    </p>
                  ))}
                </div>

                <button
                  className={`scriptpilot-plan-button ${isCurrent ? "current" : ""}`}
                  disabled={isCurrent || loading || plan.id === "free"}
                  onClick={() => setSelectedPlan(plan)}
                  type="button"
                >
                  {isCurrent
                    ? "Current Plan"
                    : plan.id === "free"
                      ? "Included"
                      : "Upgrade"}
                </button>
              </article>
            );
          })}
        </section>

        <section className="scriptpilot-comparison-card">
          <div className="scriptpilot-result-heading">
            <p className="scriptpilot-eyebrow">Feature comparison</p>
            <h3>Daily creator workflow limits</h3>
          </div>

          <div className="scriptpilot-comparison-table">
            <div className="scriptpilot-comparison-row header">
              <span>Feature</span>
              {plans.map((plan) => (
                <span key={plan.id}>{plan.name}</span>
              ))}
            </div>

            {comparisonRows.map((row) => (
              <div className="scriptpilot-comparison-row" key={row.key}>
                <span>{row.label}</span>
                {plans.map((plan) => (
                  <span key={plan.id}>{plan.limits[row.key]}</span>
                ))}
              </div>
            ))}
          </div>
        </section>
      </div>

      {selectedPlan ? (
        <UpgradeModal
          onClose={() => setSelectedPlan(null)}
          plan={selectedPlan}
        />
      ) : null}
    </DashboardShell>
  );
}

function UpgradeModal({
  onClose,
  plan,
}: {
  onClose: () => void;
  plan: Plan;
}) {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;

    setIsSubmitted(true);
  }

  return (
    <div className="scriptpilot-modal-backdrop" role="presentation">
      <section
        aria-labelledby="upgrade-modal-title"
        aria-modal="true"
        className="scriptpilot-upgrade-modal"
        role="dialog"
      >
        <button
          aria-label="Close upgrade dialog"
          className="scriptpilot-modal-close"
          onClick={onClose}
          type="button"
        >
          <X size={18} />
        </button>

        <div className="scriptpilot-modal-icon">
          {plan.id === "studio_unlimited" ? <Crown size={24} /> : <Sparkles size={24} />}
        </div>

        <p className="scriptpilot-eyebrow">{plan.name}</p>
        <h2 id="upgrade-modal-title">Web payments are launching soon.</h2>
        <p>
          Upgrade now on our Android app, or leave your email to be notified
          when web billing is available.
        </p>

        {isSubmitted ? (
          <div className="scriptpilot-modal-confirmation">
            Thanks, we&apos;ll notify you.
          </div>
        ) : (
          <form className="scriptpilot-modal-form" onSubmit={handleSubmit}>
            <label>
              <span>Email address</span>
              <input
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                type="email"
                value={email}
              />
            </label>
            <button type="submit">
              <Mail size={16} />
              Notify me
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
