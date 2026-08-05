import { CLINIC_NAME } from "@/lib/types";
import FadeInSection from "./fade-in-section";

const BRANCHES = [
  { name: "Miami", address: "214 Ocean Terrace, Miami, FL" },
  { name: "New York", address: "88 Lexington Ave, New York, NY" },
  { name: "Boston", address: "45 Newbury St, Boston, MA" },
];

const HOURS = [
  { days: "Mon–Fri", time: "8am–6pm" },
  { days: "Saturday", time: "9am–2pm" },
  { days: "Sunday", time: "Closed" },
];

const PHONE_DISPLAY = "(305) 555-0142";
const PHONE_HREF = "tel:+13055550142";
const EMAIL = "hello@brightsmiledental.com";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <FadeInSection>
      <footer id="contact" className="scroll-mt-24 border-t border-border bg-surface/60 px-4 py-14">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 text-center sm:grid-cols-3 sm:text-left">
            <div>
              <p className="text-sm font-semibold text-ink">Locations</p>
              <div className="mt-3 flex flex-col gap-3">
                {BRANCHES.map((branch) => (
                  <div key={branch.name}>
                    <p className="flex items-center justify-center gap-2 text-sm font-medium text-ink sm:justify-start">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {branch.name}
                    </p>
                    <p className="mt-1 text-sm text-ink-muted">{branch.address}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-ink">Hours</p>
              <div className="mt-3 flex flex-col gap-1.5">
                {HOURS.map((row) => (
                  <p key={row.days} className="text-sm text-ink-muted">
                    <span className="text-ink">{row.days}:</span> {row.time}
                  </p>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-ink">Contact</p>
              <div className="mt-3 flex flex-col gap-1.5">
                <a
                  href={PHONE_HREF}
                  className="nav-link self-center text-sm text-ink-muted transition-colors duration-200 hover:text-accent sm:self-start"
                >
                  {PHONE_DISPLAY}
                </a>
                <a
                  href={`mailto:${EMAIL}`}
                  className="nav-link self-center text-sm text-ink-muted transition-colors duration-200 hover:text-accent sm:self-start"
                >
                  {EMAIL}
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-center sm:flex-row sm:text-left">
            <p className="text-sm font-medium text-ink">{CLINIC_NAME}</p>
            <p className="text-xs text-ink-faint">
              &copy; {year} {CLINIC_NAME} &middot;{" "}
              <a href="#" className="nav-link transition-colors duration-200 hover:text-accent">
                Privacy
              </a>{" "}
              &middot;{" "}
              <a href="#" className="nav-link transition-colors duration-200 hover:text-accent">
                Terms
              </a>
            </p>
          </div>
        </div>
      </footer>
    </FadeInSection>
  );
}
