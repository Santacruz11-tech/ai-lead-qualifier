import { Suspense } from "react";
import ResultClient from "./ResultClient";
import PipelineProgress from "@/components/PipelineProgress";

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <ResultShell>
          <PollingCard label="Getting started…" stepIndex={0} />
        </ResultShell>
      }
    >
      <ResultClient />
    </Suspense>
  );
}

// Shared outer shell so the Suspense fallback matches the client view exactly
// (avoids a layout flash while useSearchParams resolves).
export function ResultShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 bg-background">
      <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:py-24">{children}</div>
    </main>
  );
}

export function PollingCard({ label, stepIndex }: { label: string; stepIndex: number }) {
  return (
    <div className="flex flex-col items-center gap-8 rounded-2xl border border-border bg-surface p-10 text-center shadow-[0_1px_2px_rgba(22,35,31,0.04),0_12px_32px_-16px_rgba(22,35,31,0.12)]">
      <PipelineProgress activeIndex={stepIndex} />
      <p className="text-sm text-ink-muted">{label}</p>
    </div>
  );
}
