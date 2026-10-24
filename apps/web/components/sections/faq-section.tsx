'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { faqs, site } from '@/lib/content';
import { cn } from '@/lib/utils';

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="border-line border-b py-20 md:py-28">
      <Container>
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <div className="md:sticky md:top-28">
              <p aria-hidden className="text-brand/35 font-serif text-5xl leading-none">
                08
              </p>
              <h2 className="text-title mt-4 text-balance">Everything you need to know</h2>
              <p className="text-muted mt-4 max-w-sm text-pretty leading-relaxed">
                Clear answers about booking, spa reservations, and the small details that make a
                stay feel effortless.
              </p>

              <div className="border-line mt-8 border-t pt-6">
                <p className="text-muted text-sm">Still wondering?</p>
                <a
                  href={`mailto:${site.email}`}
                  className="focus-ring text-brand mt-1 inline-block text-sm underline-offset-4 hover:underline"
                >
                  {site.email}
                </a>
              </div>
            </div>
          </div>

          <div className="md:col-span-8">
            <div className="border-line border-t">
              {faqs.map((faq, index) => {
                const isOpen = openIndex === index;

                return (
                  <div key={faq.question} className="border-line border-b">
                    <h3>
                      <button
                        type="button"
                        id={`faq-button-${index}`}
                        aria-expanded={isOpen}
                        aria-controls={`faq-panel-${index}`}
                        onClick={() => setOpenIndex(isOpen ? null : index)}
                        className="focus-ring flex min-h-16 w-full items-center justify-between gap-4 py-5 text-left"
                      >
                        <span className="font-serif text-lg leading-snug md:text-xl">
                          {faq.question}
                        </span>
                        <Plus
                          aria-hidden
                          className={cn(
                            'text-brand h-5 w-5 shrink-0 transition-transform duration-200',
                            isOpen && 'rotate-45',
                          )}
                          strokeWidth={1.5}
                        />
                      </button>
                    </h3>

                    <div
                      id={`faq-panel-${index}`}
                      role="region"
                      aria-labelledby={`faq-button-${index}`}
                      className={cn(
                        'ease-soft grid transition-[grid-template-rows] duration-200',
                        isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                      )}
                    >
                      <div className="overflow-hidden">
                        <p className="text-muted max-w-2xl pb-6 pr-8 text-sm leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
