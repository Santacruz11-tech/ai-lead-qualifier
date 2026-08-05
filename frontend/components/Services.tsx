"use client";

import { AlertCircle, Heart, Sparkles, Stethoscope, type LucideIcon } from "lucide-react";
import FadeInSection from "./fade-in-section";

const SERVICES: { title: string; body: string; icon: LucideIcon }[] = [
  {
    title: "General Dentistry",
    body: "Routine checkups, cleanings, and preventive care to keep every visit simple.",
    icon: Stethoscope,
  },
  {
    title: "Emergency Care",
    body: "Same-day relief for pain, swelling, or trauma — triaged and called back first.",
    icon: AlertCircle,
  },
  {
    title: "Cosmetic Dentistry",
    body: "Whitening, veneers, and smile makeovers designed around your goals.",
    icon: Sparkles,
  },
  {
    title: "Pediatric Dentistry",
    body: "Gentle, patient care that helps kids feel safe from their very first visit.",
    icon: Heart,
  },
];

export default function Services() {
  return (
    <section id="services" className="scroll-mt-24 px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto mb-14 max-w-xl text-center">
          <FadeInSection>
            <h2 className="text-balance text-4xl font-semibold tracking-tight text-ink sm:text-6xl">
              Our Services
            </h2>
          </FadeInSection>
          <FadeInSection delay={0.1}>
            <p className="mt-3 text-balance text-ink-muted">
              Full-family dental care, from routine cleanings to same-day emergencies.
            </p>
          </FadeInSection>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {SERVICES.map(({ title, body, icon: Icon }, i) => (
            <FadeInSection key={title} delay={0.15 + i * 0.08}>
              <div className="group relative flex h-full flex-col items-start gap-4 overflow-hidden rounded-2xl border border-border/80 bg-surface p-5 shadow-[0_1px_2px_rgba(22,35,31,0.04),0_1px_1px_rgba(22,35,31,0.02)] transition-all duration-300 before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:origin-left before:scale-x-0 before:bg-linear-to-r before:from-accent before:to-accent-hover before:transition-transform before:duration-300 before:content-[''] hover:-translate-y-1 hover:border-accent/20 hover:shadow-[0_20px_40px_-24px_rgba(22,35,31,0.25),0_2px_8px_-2px_rgba(14,124,102,0.12)] hover:before:scale-x-100 sm:p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white">
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <h3 className="text-base font-semibold text-ink sm:text-lg">{title}</h3>
                <p className="text-sm leading-relaxed text-ink-muted">{body}</p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}
