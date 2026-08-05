"use client";

import { motion } from "motion/react";

const textVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
} as const;

// Patient-facing only. No score, tier, reasoning, or red flags ever render
// here — that data lives in Notion for the front desk, not in the browser.
export default function SuccessScreen({
  firstName,
  onReset,
}: {
  firstName?: string;
  onReset: () => void;
}) {
  const title = firstName ? `Thanks, ${firstName}` : "Thanks for reaching out";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center rounded-2xl border border-border bg-surface p-8 text-center shadow-[0_1px_2px_rgba(22,35,31,0.04),0_12px_32px_-16px_rgba(22,35,31,0.12)] sm:p-10"
    >
      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 20, delay: 0.1 }}
        className="mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-accent bg-accent-soft"
      >
        <svg
          className="h-9 w-9 text-accent-hover"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}
        className="flex flex-col items-center"
      >
        <motion.h1 variants={textVariants} className="text-3xl font-semibold tracking-tight text-ink">
          {title}
        </motion.h1>

        <motion.p variants={textVariants} className="mt-4 max-w-sm text-base leading-relaxed text-ink-muted">
          We&rsquo;ve received your inquiry. Our front desk will call you back shortly.
        </motion.p>

        <motion.p variants={textVariants} className="mt-2 text-sm text-ink-faint">
          Same-day emergencies are prioritized.
        </motion.p>

        <motion.button
          type="button"
          onClick={onReset}
          variants={textVariants}
          className="mt-8 text-sm font-medium text-accent transition-colors duration-200 hover:text-accent-hover"
        >
          ← Submit another inquiry
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
