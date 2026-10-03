import type { Metadata } from 'next';
import { site } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Privacy policy',
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-serif text-4xl text-[var(--matcha-heading)]">Privacy policy</h1>
      <p className="mt-4 text-[var(--matcha-body)]">
        {site.name} collects the contact and stay details needed to complete a reservation. We use
        this information to confirm bookings, process payments, and send stay-related email.
      </p>
      <h2 className="mt-10 font-serif text-2xl text-[var(--matcha-heading)]">Payments</h2>
      <p className="mt-3 text-[var(--matcha-body)]">
        Card data is handled by Stripe. We store only Stripe customer and payment-method
        identifiers, plus card brand and last four digits, so you can reuse a saved card.
      </p>
      <h2 className="mt-10 font-serif text-2xl text-[var(--matcha-heading)]">Cookies</h2>
      <p className="mt-3 text-[var(--matcha-body)]">
        We use essential cookies for sign-in and booking. These are required to keep your session
        secure and are not used for advertising.
      </p>
      <p className="mt-8 text-[var(--matcha-body)]">Questions: {site.email}</p>
    </article>
  );
}
