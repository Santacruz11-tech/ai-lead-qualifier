"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { AlertCircle, Heart, Sparkles, Stethoscope, type LucideIcon } from "lucide-react";
import FadeInSection from "./fade-in-section";
import { useReducedMotion } from "@/lib/useReducedMotion";

// Matches Hero.tsx / PipelineProgress.tsx — the codebase's second approved
// ease curve, kept distinct from FadeInSection's [0.22, 1, 0.36, 1] so photo
// motion reads as its own beat rather than a copy of the section fade.
const ease = [0.16, 1, 0.3, 1] as const;

const SERVICES: {
  title: string;
  body: string;
  icon: LucideIcon;
  image: string;
  alt: string;
  imgPosition?: "top" | "child-focus";
}[] = [
  {
    title: "General Dentistry",
    body: "Routine checkups, cleanings, and preventive care to keep every visit simple.",
    icon: Stethoscope,
    image: "/images/service_general.png",
    alt: "Dental team performing routine examination",
  },
  {
    title: "Emergency Care",
    body: "Same-day relief for pain, swelling, or trauma — triaged and called back first.",
    icon: AlertCircle,
    image: "/images/service_emergency.png",
    alt: "Dentist reviewing dental X-ray for emergency diagnosis",
  },
  {
    title: "Cosmetic Dentistry",
    body: "Whitening, veneers, and smile makeovers designed around your goals.",
    icon: Sparkles,
    image: "/images/service_cosmetic.jpg",
    alt: "Close-up of dentist examining a patient's teeth with a mirror and probe",
  },
  {
    title: "Pediatric Dentistry",
    body: "Gentle, patient care that helps kids feel safe from their very first visit.",
    icon: Heart,
    image: "/images/service_pediatric.png",
    alt: "Dentist providing gentle care to young pediatric patient",
    // Default center-crop favored the dentist's hands over the child; shift
    // the crop window down so the child's face is the dominant subject.
    imgPosition: "child-focus",
  },
];

export default function Services() {
  const reduce = useReducedMotion();

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
          {SERVICES.map(({ title, body, icon: Icon, image, alt, imgPosition }, i) => {
            const delay = 0.15 + i * 0.08;
            const photo = (
              <Image
                src={image}
                alt={alt}
                width={800}
                height={450}
                priority={i < 2}
                className={`h-full w-full object-cover ${
                  imgPosition === "top"
                    ? "object-top"
                    : imgPosition === "child-focus"
                      ? "object-[center_68%]"
                      : "object-center"
                } ${
                  reduce
                    ? ""
                    : "transform-gpu transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform group-hover:scale-[1.04]"
                }`}
              />
            );

            return (
              <FadeInSection key={title} delay={delay}>
                <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-[0_1px_2px_rgba(22,35,31,0.04),0_1px_1px_rgba(22,35,31,0.02)] transition-all duration-300 before:absolute before:inset-x-0 before:top-0 before:z-10 before:h-[2px] before:origin-left before:scale-x-0 before:bg-linear-to-r before:from-accent before:to-accent-hover before:transition-transform before:duration-300 before:content-[''] hover:-translate-y-1 hover:border-accent/20 hover:shadow-[0_20px_40px_-24px_rgba(22,35,31,0.25),0_2px_8px_-2px_rgba(14,124,102,0.12)] hover:before:scale-x-100">
                  <div className="relative aspect-video w-full overflow-hidden">
                    {reduce ? (
                      photo
                    ) : (
                      <motion.div
                        className="h-full w-full"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.5, ease, delay }}
                      >
                        {photo}
                      </motion.div>
                    )}

                    <div
                      className={`absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-accent text-background shadow-md ${
                        reduce
                          ? ""
                          : "transform-gpu transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform group-hover:-translate-y-0.5 group-hover:rotate-3"
                      }`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={2} />
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col items-start gap-2 p-5 sm:p-6">
                    <h3 className="text-base font-semibold text-ink sm:text-lg">{title}</h3>
                    <p className="text-sm leading-relaxed text-ink-muted">{body}</p>
                  </div>
                </div>
              </FadeInSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
