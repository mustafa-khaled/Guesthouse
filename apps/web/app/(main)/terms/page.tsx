import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/ui/page-header';
import { site } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Terms of stay',
};

export default function TermsPage() {
  return (
    <Container className="max-w-3xl py-12 md:py-16">
      <PageHeader
        folio="—"
        title="Terms of stay"
        description="The practical agreement between you and us — reservations, payment, and cancellation."
      />

      <div className="mt-10 space-y-10">
        <section>
          <h2 className="font-serif text-2xl leading-snug">Reservations</h2>
          <p className="text-muted mt-3 text-pretty leading-relaxed">
            These terms govern reservations, payments, and stays at {site.name}. By booking you
            agree to the rate plan cancellation rules shown at checkout and to paying any remaining
            balance at the hotel when the rate is pay-at-hotel.
          </p>
        </section>

        <section className="border-line border-t pt-6">
          <h2 className="font-serif text-2xl leading-snug">Payments</h2>
          <p className="text-muted mt-3 text-pretty leading-relaxed">
            Card payments are processed by Stripe. We do not store full card numbers. Deposits and
            prepaid rates are charged when you confirm the booking. Refunds follow the cancellation
            policy on your rate plan.
          </p>
        </section>

        <section className="border-line border-t pt-6">
          <h2 className="font-serif text-2xl leading-snug">Cancellations</h2>
          <p className="text-muted mt-3 text-pretty leading-relaxed">
            You may cancel from your account while the booking is pending or confirmed. Flexible
            rates refund the amount paid if you cancel before the deadline. Non-refundable rates are
            not refunded after purchase.
          </p>
        </section>

        <section className="border-line border-t pt-6">
          <h2 className="font-serif text-2xl leading-snug">Questions</h2>
          <p className="text-muted mt-3 leading-relaxed">
            Write to{' '}
            <a
              href={`mailto:${site.email}`}
              className="text-brand underline-offset-4 hover:underline"
            >
              {site.email}
            </a>{' '}
            and we will answer within one business day.
          </p>
        </section>
      </div>
    </Container>
  );
}
