import type { Metadata } from 'next';
import { BillingClient } from '@/features/billing/components/billing-client';

export const metadata: Metadata = {
  title: 'Payment methods',
};

export default function BillingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 font-serif text-3xl text-[var(--matcha-heading)]">Payment methods</h1>
      <p className="mb-8 text-[var(--matcha-body)]">
        Save a card for faster checkout. Cards are stored securely with Stripe.
      </p>
      <BillingClient />
    </div>
  );
}
