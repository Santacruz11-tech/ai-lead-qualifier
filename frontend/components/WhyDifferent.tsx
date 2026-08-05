"use client";

import FadeInSection from "./fade-in-section";

const FEATURES = [
  {
    title: "Priority, not first-come",
    body: "Every submission is scored the moment it lands, so the front desk calls back the most urgent patients first — not just the earliest.",
    icon: PriorityIcon,
  },
  {
    title: "Same-day emergencies flagged",
    body: "Severe pain and urgent language are caught automatically and marked for a callback within the hour, day or night.",
    icon: EmergencyIcon,
  },
  {
    title: "Insurance pre-checked",
    body: "We note your provider up front, so the team can confirm coverage before you even pick up the phone.",
    icon: ShieldIcon,
  },
];

export default function WhyDifferent() {
  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto mb-14 max-w-xl text-center">
          <FadeInSection>
            <h2 className="text-balance text-4xl font-semibold tracking-tight text-ink sm:text-6xl">
              Why our intake is different
            </h2>
          </FadeInSection>
          <FadeInSection delay={0.1}>
            <p className="mt-3 text-balance text-ink-muted">
              No hold music, no generic queue. Your details go straight into a
              triage system built for dental urgency.
            </p>
          </FadeInSection>
        </div>

        <div className="grid gap-10 sm:grid-cols-3 sm:gap-8">
          {FEATURES.map(({ title, body, icon: Icon }, i) => (
            <FadeInSection key={title} delay={0.2 + i * 0.1}>
              <div className="flex flex-col items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <Icon />
                </div>
                <h3 className="text-lg font-semibold text-ink">{title}</h3>
                <p className="text-sm leading-relaxed text-ink-muted">{body}</p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}

const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function PriorityIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 16h4M4 11h7M4 6h10" />
      <path d="M16 18l3-3 3 3M19 15v6" />
    </svg>
  );
}

function EmergencyIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2.5M9 2h6" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
