"use client";

import { motion, AnimatePresence } from "motion/react";

const STEPS = ["Sending your details", "Reviewing your case", "Notifying our front desk"] as const;

const PENDING_FILL = "#d4d4d4"; // neutral-300

// Business-facing progress copy only — never mentions validation, LLM
// scoring, or the CRM write happening underneath.
export default function PipelineProgress({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="flex w-full items-start justify-center">
      {STEPS.map((step, i) => {
        const state = i < activeIndex ? "done" : i === activeIndex ? "active" : "pending";
        return (
          <div key={step} className="flex flex-1 items-start last:flex-none">
            <div className="flex w-20 flex-col items-center gap-2 sm:w-28">
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
                {state === "active" && (
                  <motion.span
                    className="absolute inset-0 rounded-full bg-accent/25"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
                <motion.div
                  animate={{
                    backgroundColor: state === "pending" ? PENDING_FILL : "var(--accent)",
                  }}
                  transition={{ duration: 0.3 }}
                  className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full"
                >
                  <AnimatePresence>
                    {state === "done" && (
                      <motion.svg
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="h-3 w-3 text-white"
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 10l4 4 8-8" />
                      </motion.svg>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
              <span
                className={`text-center text-[0.7rem] font-medium leading-tight transition-colors duration-300 ${
                  state === "pending" ? "text-ink-faint" : "text-ink-muted"
                }`}
              >
                {step}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="mx-1 mt-4 h-px flex-1 bg-border sm:mx-2">
                <motion.div
                  className="h-px bg-accent"
                  initial={{ width: "0%" }}
                  animate={{ width: state === "pending" ? "0%" : "100%" }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
