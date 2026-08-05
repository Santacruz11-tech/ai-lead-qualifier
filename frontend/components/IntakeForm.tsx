"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import PhoneInput, { type Country } from "react-phone-number-input";
import { getExampleNumber } from "libphonenumber-js";
import examples from "libphonenumber-js/examples.mobile.json";
import "react-phone-number-input/style.css";
import type { LeadInput } from "@/lib/types";
import { CLINIC_LOCATIONS } from "@/lib/types";
import FadeInSection from "./fade-in-section";

const initialForm: LeadInput = {
  fullName: "",
  phone: "",
  email: "",
  patientType: "not_sure",
  reasonForVisit: "",
  painLevel: "none",
  insuranceProvider: "",
  preferredClinic: "No preference",
  preferredTiming: "flexible",
  source: "",
};

const PAIN_LEVELS: { value: LeadInput["painLevel"]; label: string }[] = [
  { value: "none", label: "None" },
  { value: "mild", label: "Mild" },
  { value: "moderate", label: "Moderate" },
  { value: "severe", label: "Severe" },
];

const NEW_PATIENT_OPTIONS: { value: LeadInput["patientType"]; label: string }[] = [
  { value: "new", label: "Yes" },
  { value: "returning", label: "No, returning" },
  { value: "not_sure", label: "Not sure" },
];

const PREFERRED_TIMING_OPTIONS: { value: LeadInput["preferredTiming"]; label: string }[] = [
  { value: "asap", label: "ASAP (emergency)" },
  { value: "this_week", label: "This week" },
  { value: "next_2_weeks", label: "Next 2 weeks" },
  { value: "this_month", label: "This month" },
  { value: "flexible", label: "No rush / flexible" },
];

const SOURCE_OPTIONS: { value: LeadInput["source"]; label: string }[] = [
  { value: "", label: "Prefer not to say" },
  { value: "google_search", label: "Google search" },
  { value: "instagram_ad", label: "Instagram ad" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "referral", label: "Friend/referral" },
  { value: "walk_in", label: "Walked by" },
  { value: "other", label: "Other" },
];

export default function IntakeForm() {
  const router = useRouter();
  const [form, setForm] = useState<LeadInput>(initialForm);
  const [phoneCountry, setPhoneCountry] = useState<Country | undefined>("US");
  const [autoAdjustedTiming, setAutoAdjustedTiming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof LeadInput>(key: K, value: LeadInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Auto-set Preferred Timing to ASAP when pain level is severe. Does not
  // revert automatically if the patient later changes pain level away from
  // severe — their last explicit timing choice always wins.
  useEffect(() => {
    if (form.painLevel === "severe") {
      setForm((prev) => (prev.preferredTiming === "asap" ? prev : { ...prev, preferredTiming: "asap" }));
      setAutoAdjustedTiming(true);
    }
  }, [form.painLevel]);

  function handleTimingChange(value: LeadInput["preferredTiming"]) {
    update("preferredTiming", value);
    setAutoAdjustedTiming(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // "Prefer not to say" is represented locally as "" (see LeadInput comment);
      // omit the key entirely rather than sending an empty string to the backend.
      const { source, ...rest } = form;
      const payload = source ? { ...rest, source } : rest;

      const response = await fetch("/api/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Something went wrong submitting your inquiry.");
      }

      const firstName = form.fullName.trim().split(/\s+/)[0];
      const params = new URLSearchParams({ runId: data.runId });
      if (firstName) params.set("name", firstName);
      router.push(`/result?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <section id="intake-form" className="scroll-mt-24 px-4 pb-24 sm:pb-32">
      <div className="mx-auto w-full max-w-2xl">
        <FadeInSection className="mb-8 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Tell us what&rsquo;s going on
          </h2>
          <p className="mt-3 text-balance text-ink-muted">
            Takes about a minute. Emergencies get a callback first.
          </p>
        </FadeInSection>

        <FadeInSection delay={0.15}>
        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-2xl border border-border bg-surface p-6 shadow-[0_1px_2px_rgba(22,35,31,0.04),0_12px_32px_-16px_rgba(22,35,31,0.12)] sm:p-8"
        >
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-ink">Contact information</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" htmlFor="fullName" required>
                <input
                  id="fullName"
                  required
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  placeholder="Jane Doe"
                  className={inputClass}
                />
              </Field>
              <Field label="Phone number" htmlFor="phone" required>
                <PhoneInput
                  id="phone"
                  international
                  defaultCountry="US"
                  countryCallingCodeEditable={false}
                  required
                  value={form.phone}
                  onChange={(value) => update("phone", value ?? "")}
                  onCountryChange={setPhoneCountry}
                  placeholder={getExampleNumber(phoneCountry ?? "US", examples)?.formatNational() ?? "Phone number"}
                  className="phone-input-wrapper"
                />
              </Field>
            </div>
            <Field label="Email" htmlFor="email">
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="jane@example.com"
                className={inputClass}
              />
            </Field>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-ink">Visit details</legend>
            <Field label="Reason for visit" htmlFor="reasonForVisit" required>
              <textarea
                id="reasonForVisit"
                required
                rows={3}
                value={form.reasonForVisit}
                onChange={(e) => update("reasonForVisit", e.target.value)}
                placeholder="e.g. Cracked molar, throbbing pain since last night"
                className={inputClass}
              />
            </Field>

            <div>
              <span className="mb-2 block text-sm font-medium text-ink-muted">Pain level</span>
              <div className="grid grid-cols-4 gap-2">
                {PAIN_LEVELS.map((level) => (
                  <PillOption
                    key={level.value}
                    label={level.label}
                    selected={form.painLevel === level.value}
                    onClick={() => update("painLevel", level.value)}
                  />
                ))}
              </div>
            </div>

            <div>
              <span className="mb-2 block text-sm font-medium text-ink-muted">
                Are you a new patient?
              </span>
              <div className="grid grid-cols-3 gap-2">
                {NEW_PATIENT_OPTIONS.map((opt) => (
                  <PillOption
                    key={opt.value}
                    label={opt.label}
                    selected={form.patientType === opt.value}
                    onClick={() => update("patientType", opt.value)}
                  />
                ))}
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-ink">Logistics</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Insurance provider" htmlFor="insuranceProvider">
                <input
                  id="insuranceProvider"
                  value={form.insuranceProvider}
                  onChange={(e) => update("insuranceProvider", e.target.value)}
                  placeholder="e.g. Delta Dental, or 'None'"
                  className={inputClass}
                />
              </Field>
              <Field label="Preferred clinic" htmlFor="preferredClinic">
                <select
                  id="preferredClinic"
                  value={form.preferredClinic}
                  onChange={(e) =>
                    update("preferredClinic", e.target.value as LeadInput["preferredClinic"])
                  }
                  className={inputClass}
                >
                  <option value="No preference">No preference</option>
                  {CLINIC_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="When would you like to come in?" htmlFor="preferredTiming">
                <select
                  id="preferredTiming"
                  value={form.preferredTiming}
                  onChange={(e) => handleTimingChange(e.target.value as LeadInput["preferredTiming"])}
                  className={inputClass}
                >
                  {PREFERRED_TIMING_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {autoAdjustedTiming && (
                  <p className="mt-1 text-xs text-ink-faint">
                    ⓘ Auto-set to ASAP based on pain level. You can change this.
                  </p>
                )}
              </Field>
              <Field label="How did you hear about us?" htmlFor="source">
                <select
                  id="source"
                  value={form.source}
                  onChange={(e) => update("source", e.target.value as LeadInput["source"])}
                  className={inputClass}
                >
                  {SOURCE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </fieldset>

          {error && (
            <div className="rounded-lg border border-hot/30 bg-hot-soft px-4 py-3 text-sm text-hot">
              {error}
            </div>
          )}

          <motion.button
            type="submit"
            disabled={submitting}
            whileHover={submitting ? undefined : { y: -2 }}
            whileTap={submitting ? undefined : { scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="btn-primary group mx-auto flex w-full max-w-xs items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-ink-faint"
          >
            {submitting ? (
              <>
                <Spinner />
                Analyzing&hellip;
              </>
            ) : (
              <>
                Send to front desk
                <ArrowIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </>
            )}
          </motion.button>
        </form>
        </FadeInSection>
      </div>
    </section>
  );
}

const inputClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-faint outline-none transition-colors duration-200 focus:border-accent focus:ring-2 focus:ring-accent/30";

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-muted">
        {label}
        {required && <span className="ml-0.5 text-accent">*</span>}
      </span>
      {children}
    </label>
  );
}

function PillOption({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all duration-200 sm:text-sm ${
        selected
          ? "border-accent bg-accent-soft text-accent-hover shadow-sm"
          : "border-neutral-200 bg-white text-neutral-700 hover:border-accent/40 hover:text-accent-hover"
      }`}
    >
      {label}
    </button>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  );
}
