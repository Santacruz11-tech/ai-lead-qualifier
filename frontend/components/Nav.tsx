"use client";

import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Icon } from "@iconify/react";
import { ArrowRight, Menu, Phone, X } from "lucide-react";
import { CLINIC_NAME } from "@/lib/types";

const LOGO_ICON = "mdi:tooth-outline";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const PHONE_DISPLAY = "(305) 555-0142";
const PHONE_HREF = "tel:+13055550142";

// Short form for the nav — the full legal name ("Bright Smile Dental Clinic")
// stays in the Hero; this is a text-logo treatment, not a rename.
const LOGO_TEXT = CLINIC_NAME.replace(/\s+Clinic$/i, "");

export default function Nav() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 24);
  });

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? "border-b border-[rgba(22,35,31,0.08)] bg-surface-nav/90 shadow-[0_8px_24px_-18px_rgba(22,35,31,0.35)] backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div aria-hidden className="h-[3px] w-full bg-linear-to-r from-accent via-accent-hover to-accent" />
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-20">
          <a href="#home" className="flex items-center gap-2 text-ink" onClick={closeMenu}>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-[#faf7f2]">
              <Icon icon={LOGO_ICON} width={18} height={18} />
            </span>
            <span className="text-base font-semibold tracking-tight">{LOGO_TEXT}</span>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="nav-link text-sm font-medium text-ink-muted transition-colors duration-200 hover:text-ink"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-5 md:flex">
            <a
              href={PHONE_HREF}
              className="flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors duration-200 hover:text-ink"
            >
              <Phone className="h-4 w-4" strokeWidth={1.8} />
              {PHONE_DISPLAY}
            </a>
            <a
              href="#intake-form"
              className="btn-primary group inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white"
            >
              Book Appointment
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink transition-colors duration-200 hover:bg-accent-soft md:hidden"
          >
            <Menu className="h-5 w-5" strokeWidth={1.8} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMenu}
              className="fixed inset-0 z-40 bg-ink/40 md:hidden"
            />
            <motion.div
              key="panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 right-0 z-50 flex w-72 max-w-[80vw] flex-col gap-8 bg-surface p-6 shadow-[0_1px_2px_rgba(22,35,31,0.04),0_12px_32px_-16px_rgba(22,35,31,0.12)] md:hidden"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-ink">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-[#faf7f2]">
                    <Icon icon={LOGO_ICON} width={18} height={18} />
                  </span>
                  <span className="text-base font-semibold tracking-tight">{LOGO_TEXT}</span>
                </span>
                <button
                  type="button"
                  onClick={closeMenu}
                  aria-label="Close menu"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-ink transition-colors duration-200 hover:bg-accent-soft"
                >
                  <X className="h-5 w-5" strokeWidth={1.8} />
                </button>
              </div>

              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors duration-200 hover:bg-accent-soft hover:text-ink"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>

              <div className="mt-auto flex flex-col gap-3 border-t border-border pt-6">
                <a
                  href={PHONE_HREF}
                  className="flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors duration-200 hover:text-ink"
                >
                  <Phone className="h-4 w-4" strokeWidth={1.8} />
                  {PHONE_DISPLAY}
                </a>
                <a
                  href="#intake-form"
                  onClick={closeMenu}
                  className="btn-primary group flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Book Appointment
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
