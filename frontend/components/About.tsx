"use client";

import FadeInSection from "./fade-in-section";

const STATS = [
  { value: "15+", label: "years experience" },
  { value: "50,000+", label: "patients served" },
  { value: "Same-day", label: "emergency slots" },
];

export default function About() {
  return (
    <section id="about" className="scroll-mt-24 px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-4xl text-center">
        <FadeInSection>
          <h2 className="text-balance text-4xl font-semibold tracking-tight text-ink sm:text-6xl">
            Trusted care across Miami, New York, and Boston
          </h2>
        </FadeInSection>

        <FadeInSection delay={0.1}>
          <p className="mx-auto mt-5 max-w-2xl text-balance text-ink-muted">
            We built our intake around one idea: the patient in the most pain should never
            wait behind the patient who called first. Every inquiry is triaged the moment
            it arrives, so our front desk can reach same-day emergencies within minutes and
            everyone else on a timeline that actually fits their care.
          </p>
        </FadeInSection>

        <FadeInSection delay={0.2}>
          <div className="mx-auto mt-12 grid max-w-2xl grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1.5 px-6 py-5 first:pt-0 last:pb-0 sm:py-0">
                <span className="font-mono text-3xl font-semibold tracking-tight text-accent tabular-nums sm:text-4xl">
                  {stat.value}
                </span>
                <span className="text-sm text-ink-muted">{stat.label}</span>
              </div>
            ))}
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}
