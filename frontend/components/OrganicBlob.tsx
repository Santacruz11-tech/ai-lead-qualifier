"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useSyncExternalStore } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

const DESKTOP_QUERY = "(min-width: 640px)";

function subscribeToDesktopQuery(callback: () => void) {
  const mq = window.matchMedia(DESKTOP_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

// useSyncExternalStore (rather than useState+useEffect) so the server
// snapshot (false) and the first client render agree — reading
// window.matchMedia synchronously in a state initializer would otherwise
// produce a hydration mismatch.
function useIsDesktop() {
  return useSyncExternalStore(
    subscribeToDesktopQuery,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false
  );
}

// The page's one signature element: a soft, slow-drifting teal field behind
// the clinic name. Reads as calm/ambient rather than decorative — the kind
// of detail that should be felt more than noticed.
export default function OrganicBlob() {
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 500], [0, 60]);
  const parallaxY2 = useTransform(scrollY, [0, 500], [0, -40]);
  const reduceMotion = useReducedMotion();
  const isDesktop = useIsDesktop();
  const enableParallax = isDesktop && !reduceMotion;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <motion.div
        className="absolute left-1/2 top-[-10%] h-[70vw] max-h-[900px] w-[70vw] max-w-[900px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in srgb, var(--accent) 16%, transparent), transparent 70%)",
          filter: "blur(40px)",
          ...(enableParallax ? { y: parallaxY } : {}),
        }}
        animate={{
          scale: [1, 1.08, 1],
          x: ["-52%", "-48%", "-52%"],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute right-[-10%] top-[20%] h-[40vw] max-h-[520px] w-[40vw] max-w-[520px] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in srgb, var(--warm) 10%, transparent), transparent 70%)",
          filter: "blur(50px)",
          ...(enableParallax ? { y: parallaxY2 } : {}),
        }}
        animate={{
          scale: [1, 1.12, 1],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
    </div>
  );
}
