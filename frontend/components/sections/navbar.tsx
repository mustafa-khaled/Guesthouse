"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { navLinks, site } from "@/lib/content";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-matcha-border bg-matcha-surface/95 backdrop-blur-sm">
      <Container as="nav" aria-label="Main" className="flex h-16 items-center justify-between md:h-20">
        <a
          href="#"
          className="font-serif text-xl font-medium tracking-tight text-matcha-heading md:text-2xl"
        >
          {site.name}
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-matcha-body transition-colors hover:text-matcha-brand"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:block">
          <Button href="#book">Book your stay</Button>
        </div>

        <button
          type="button"
          className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-[4px] border border-matcha-border bg-matcha-white md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <span className="flex flex-col gap-1.5">
            <span className={cn("block h-0.5 w-5 bg-matcha-brand transition-transform", open && "translate-y-2 rotate-45")} />
            <span className={cn("block h-0.5 w-5 bg-matcha-brand transition-opacity", open && "opacity-0")} />
            <span className={cn("block h-0.5 w-5 bg-matcha-brand transition-transform", open && "-translate-y-2 -rotate-45")} />
          </span>
        </button>
      </Container>

      {open && (
        <div id="mobile-nav" className="border-t border-matcha-border bg-matcha-surface md:hidden">
          <Container className="flex flex-col gap-2 py-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="min-h-12 rounded-[4px] px-3 py-3 text-sm text-matcha-body hover:bg-matcha-brand-medium/20"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Button href="#book" className="mt-2 w-full">
              Book your stay
            </Button>
          </Container>
        </div>
      )}
    </header>
  );
}
