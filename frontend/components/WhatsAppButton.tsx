"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";

// Decorative only — this is a portfolio demo, so the button scrolls to the
// real intake form instead of opening an actual WhatsApp chat.
export default function WhatsAppButton() {
  const [hovered, setHovered] = useState(false);

  function handleClick() {
    document.getElementById("intake-form")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-50"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        role="tooltip"
        className={`absolute bottom-1/2 right-full mr-3 translate-y-1/2 whitespace-nowrap rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-background shadow-sm transition-all duration-200 ${
          hovered ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        Chat with us
      </span>
      <button
        type="button"
        onClick={handleClick}
        aria-label="Chat with us"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_32px_-8px_rgba(37,211,102,0.5)] transition-transform duration-200 hover:scale-105"
      >
        <MessageCircle className="h-6 w-6" strokeWidth={1.8} fill="currentColor" fillOpacity={0.15} />
      </button>
    </div>
  );
}
