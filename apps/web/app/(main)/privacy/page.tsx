import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/ui/page-header';
import { site } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Privacy policy',
};

export default function PrivacyPage() {
  return (
    <Container className="max-w-3xl py-12 md:py-16">
      <PageHeader
        folio="—"
        title="Privacy policy"
        description="What we collect, why we hold it, and how you can ask us to let it go."
      />

      <div className="mt-10 space-y-10">
        <section>
          <h2 className="font-serif text-2xl leading-snug">What we collect</h2>
          <p className="text-muted mt-3 text-pretty leading-relaxed">
            {site.name} collects the contact and stay details needed to complete a reservation. We
            use this information to confirm bookings, process payments, and send stay-related email.
          </p>
        </section>

        <section className="border-line border-t pt-6">
          <h2 className="font-serif text-2xl leading-snug">Payments</h2>
          <p className="text-muted mt-3 text-pretty leading-relaxed">
            Card data is handled by Stripe. We store only Stripe customer and payment-method
            identifiers, plus card brand and last four digits, so you can reuse a saved card.
          </p>
        </section>

        <section className="border-line border-t pt-6">
          <h2 className="font-serif text-2xl leading-snug">Cookies</h2>
          <p className="text-muted mt-3 text-pretty leading-relaxed">
            We use essential cookies for sign-in and booking. These are required to keep your
            session secure and are not used for advertising.
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
