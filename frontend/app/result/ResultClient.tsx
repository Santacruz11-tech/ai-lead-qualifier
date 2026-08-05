"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import type { QualifyLeadOutput } from "@/lib/types";
import { ResultShell, PollingCard } from "./page";
import SuccessScreen from "@/components/success-screen";

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 150; // ~5 minutes
const STEP_ADVANCE_MS = 1800;

// Business-facing copy only — a patient waiting here never needs to know
// there's an LLM qualifier or a Notion write behind these steps.
const LOADING_LABELS = [
  "Checking that everything looks complete...",
  "One of our team members is looking at your details...",
  "Making sure the right person gets back to you...",
];

type PollState =
  | { phase: "loading" }
  | { phase: "done"; output: QualifyLeadOutput }
  | { phase: "error"; message: string };

export default function ResultClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const runId = searchParams.get("runId");
  const firstName = searchParams.get("name") || undefined;
  const [state, setState] = useState<PollState>(() =>
    runId ? { phase: "loading" } : { phase: "error", message: "No run ID was provided." }
  );
  const [stepIndex, setStepIndex] = useState(0);
  const pollCount = useRef(0);

  useEffect(() => {
    if (!runId) {
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function poll() {
      try {
        const response = await fetch(`/api/qualify/status?runId=${encodeURIComponent(runId!)}`);
        const data = await response.json();

        if (cancelled) return;

        if (!response.ok) {
          setState({ phase: "error", message: data.error ?? "Failed to fetch run status." });
          return;
        }

        if (data.status === "COMPLETED") {
          setState({ phase: "done", output: data.output as QualifyLeadOutput });
          return;
        }

        if (data.status === "FAILED") {
          setState({
            phase: "error",
            message: data.error ?? "The qualification run did not complete successfully.",
          });
          return;
        }

        // Deliberately does not surface latency to the patient — the
        // animation keeps looping on the last step until we get a result.
        pollCount.current += 1;
        if (pollCount.current >= MAX_POLLS) {
          setState({
            phase: "error",
            message: "This is taking longer than expected. Please try again.",
          });
          return;
        }

        timer = setTimeout(poll, POLL_INTERVAL_MS);
      } catch {
        if (cancelled) return;
        pollCount.current += 1;
        if (pollCount.current >= MAX_POLLS) {
          setState({ phase: "error", message: "Failed to reach the server. Please try again." });
          return;
        }
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    }

    poll();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [runId]);

  useEffect(() => {
    if (state.phase !== "loading") return;
    const interval = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, LOADING_LABELS.length - 1));
    }, STEP_ADVANCE_MS);
    return () => clearInterval(interval);
  }, [state.phase]);

  if (state.phase === "loading") {
    return (
      <ResultShell>
        <PollingCard label={LOADING_LABELS[stepIndex]} stepIndex={stepIndex} />
      </ResultShell>
    );
  }

  if (state.phase === "error") {
    return (
      <ResultShell>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-hot/30 bg-surface p-8 text-center shadow-[0_1px_2px_rgba(22,35,31,0.04),0_12px_32px_-16px_rgba(22,35,31,0.12)]"
        >
          <p className="mb-1 text-sm font-semibold text-hot-text">
            We couldn&rsquo;t complete your qualification
          </p>
          <p className="mb-6 text-sm text-ink-muted">{state.message}</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-accent-hover hover:shadow-md"
          >
            Back to form
          </Link>
        </motion.div>
      </ResultShell>
    );
  }

  return (
    <ResultShell>
      <SuccessScreen firstName={firstName} onReset={() => router.push("/")} />
    </ResultShell>
  );
}
