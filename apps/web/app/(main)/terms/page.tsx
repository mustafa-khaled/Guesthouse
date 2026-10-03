import type { Metadata } from 'next';
import { site } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Terms of stay',
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-serif text-4xl text-[var(--matcha-heading)]">Terms of stay</h1>
      <p className="mt-4 text-[var(--matcha-body)]">
        These terms govern reservations, payments, and stays at {site.name}. By booking you agree to
        the rate plan cancellation rules shown at checkout and to paying any remaining balance at
        the hotel when the rate is pay-at-hotel.
      </p>
      <h2 className="mt-10 font-serif text-2xl text-[var(--matcha-heading)]">Payments</h2>
      <p className="mt-3 text-[var(--matcha-body)]">
        Card payments are processed by Stripe. We do not store full card numbers. Deposits and
        prepaid rates are charged when you confirm the booking. Refunds follow the cancellation
        policy on your rate plan.
      </p>
      <h2 className="mt-10 font-serif text-2xl text-[var(--matcha-heading)]">Cancellations</h2>
      <p className="mt-3 text-[var(--matcha-body)]">
        You may cancel from your account while the booking is pending or confirmed. Flexible rates
        refund the amount paid if you cancel before the deadline. Non-refundable rates are not
        refunded after purchase.
      </p>
    </article>
  );
}
