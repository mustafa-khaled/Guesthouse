"use client";

import { useState } from "react";
import { Section } from "@/components/ui/section";
import { faqs } from "@/lib/content";
import { cn } from "@/lib/utils";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section
      id="faq"
      variant="divider"
      eyebrow="Questions"
      title="Everything you need to know"
      description="Clear answers about booking, spa reservations, and wellness packages."
    >
      <div className="mx-auto max-w-3xl divide-y divide-matcha-border border-y border-matcha-border">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div key={faq.question}>
              <button
                type="button"
                className="flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left"
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span className="font-medium text-matcha-heading">{faq.question}</span>
                <span
                  aria-hidden
                  className={cn(
                    "text-xl text-matcha-brand transition-transform",
                    isOpen && "rotate-45",
                  )}
                >
                  +
                </span>
              </button>
              {isOpen && (
                <div className="pb-5 pr-8 text-sm leading-relaxed text-matcha-body">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}
