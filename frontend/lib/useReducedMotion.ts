"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

// motion/react's own useReducedMotion reads matchMedia synchronously on
// first client render, which disagrees with the SSR pass (no window) and
// triggers a hydration mismatch. useSyncExternalStore's getServerSnapshot
// keeps the first client render aligned with the server, then React
// reconciles the real value right after hydration with no warning.
export function useReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  );
}
