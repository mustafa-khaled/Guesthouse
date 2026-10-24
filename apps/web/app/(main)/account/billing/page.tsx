import type { Metadata } from 'next';
import { BillingClient } from '@/features/billing/components/billing-client';
import { AccountNav } from '@/components/shared/account-nav';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/ui/page-header';

export const metadata: Metadata = {
  title: 'Payment methods',
};

export default function BillingPage() {
  return (
    <Container className="py-12 md:py-16">
      <PageHeader
        folio="—"
        title="Payment methods"
        description="Save a card for a faster checkout next time. Card details are held securely with Stripe and never touch our servers."
        backHref="/account"
        backLabel="Account"
      />

      <div className="mt-6">
        <AccountNav />
      </div>

      <div className="mt-10 max-w-2xl">
        <BillingClient />
      </div>
    </Container>
  );
}
