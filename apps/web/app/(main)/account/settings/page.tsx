import type { Metadata } from 'next';
import ProfileForm from '@/components/ProfileForm';
import PasswordForm from '@/components/PasswordForm';
import { AccountNav } from '@/components/shared/account-nav';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/ui/page-header';

export const metadata: Metadata = {
  title: 'Account settings',
};

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-line border-t pt-6">
      <div className="grid gap-6 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-4">
          <h2 className="font-serif text-xl leading-snug">{title}</h2>
          <p className="text-muted mt-1.5 text-sm leading-relaxed">{description}</p>
        </div>
        <div className="md:col-span-8">{children}</div>
      </div>
    </section>
  );
}

export default function AccountSettingsPage() {
  return (
    <Container className="py-12 md:py-16">
      <PageHeader
        folio="—"
        title="Account settings"
        description="Your login details and the name we use when we write to you."
        backHref="/account"
        backLabel="Account"
      />

      <div className="mt-6">
        <AccountNav />
      </div>

      <div className="mt-10 max-w-3xl space-y-10">
        <Section title="Your details" description="The name and email tied to your account.">
          <ProfileForm />
        </Section>

        <Section
          title="Password"
          description="Choose something memorable. At least six characters."
        >
          <PasswordForm />
        </Section>
      </div>
    </Container>
  );
}
