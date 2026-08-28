"use client";

import { useState } from "react";
import type { FaqView } from "@/lib/site";

/**
 * Accessible FAQ accordion. Keyboard-usable (native <button>), clear open/close
 * state, uses aria-expanded / aria-controls. No animation library.
 */
export function FaqAccordion({ faqs }: { faqs: FaqView[] }) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <div
            key={faq.id}
            className="overflow-hidden rounded-2xl border border-border bg-surface"
          >
            <h3>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start text-sm font-semibold text-foreground transition-colors hover:bg-elevated focus-visible:outline-gold sm:text-base"
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${faq.id}`}
                id={`faq-button-${faq.id}`}
                onClick={() => setOpenId(isOpen ? null : faq.id)}
              >
                <span>{faq.question}</span>
                <svg
                  className={`h-5 w-5 flex-shrink-0 text-gold transition-transform ${isOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </h3>
            <div
              id={`faq-panel-${faq.id}`}
              role="region"
              aria-labelledby={`faq-button-${faq.id}`}
              hidden={!isOpen}
              className="border-t border-border px-5 py-4 text-sm leading-7 text-muted"
            >
              {faq.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
