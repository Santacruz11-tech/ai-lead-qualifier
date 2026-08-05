"use client";

import { useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type Variants,
} from "motion/react";
import { CLINIC_LOCATIONS, CLINIC_NAME } from "@/lib/types";
import { useReducedMotion } from "@/lib/useReducedMotion";
import OrganicBlob from "./OrganicBlob";

const ease = [0.16, 1, 0.3, 1] as const;

const badgeVariants: Variants = {
  hidden: { opacity: 0, y: -16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0, ease } },
};

const titleVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.15, ease } },
};

const subtitleVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.35, ease } },
};

const pillsContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.5 } },
};

const pillItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

export default function Hero() {
  const { scrollY } = useScroll();
  const badgeOpacity = useTransform(scrollY, [0, 400], [1, 0.3]);
  const reduceMotion = useReducedMotion();
  const [showScrollHint, setShowScrollHint] = useState(true);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setShowScrollHint(latest <= 100);
  });

  return (
    <section className="relative isolate overflow-hidden px-4 pb-12 pt-8 sm:pb-16 sm:pt-10">
      <OrganicBlob />
      <div className="relative mx-auto flex max-w-5xl flex-col items-center text-center">
        <motion.div variants={badgeVariants} initial="hidden" animate="show" className="mb-5">
          <motion.span
            style={reduceMotion ? undefined : { opacity: badgeOpacity }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3.5 py-1.5 font-mono text-[0.7rem] tracking-[-0.01em] text-ink-muted shadow-sm backdrop-blur"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Patient intake, triaged in minutes
          </motion.span>
        </motion.div>

        <motion.h1
          variants={titleVariants}
          initial="hidden"
          animate="show"
          className="text-balance text-[clamp(2.75rem,8vw,7rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-ink"
        >
          {CLINIC_NAME}
        </motion.h1>

        <motion.p
          variants={subtitleVariants}
          initial="hidden"
          animate="show"
          className="mt-5 max-w-xl text-balance text-lg text-ink-muted sm:text-xl"
        >
          Tell us what&rsquo;s going on. Our front desk calls back the people who
          need us most first &mdash; same-day emergencies before routine cleanings.
        </motion.p>

        <motion.div
          variants={pillsContainer}
          initial="hidden"
          animate="show"
          className="mt-6 flex flex-wrap items-center justify-center gap-2.5"
        >
          {CLINIC_LOCATIONS.map((loc) => (
            <motion.span
              key={loc}
              variants={pillItem}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-sm font-medium text-ink-muted shadow-sm"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {loc}
            </motion.span>
          ))}
        </motion.div>
      </div>

      {showScrollHint && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 md:block"
        >
          <motion.div
            animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-accent/60"
          >
            <ChevronDownIcon />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
