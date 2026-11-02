import type { Metadata } from 'next';
import { ExperiencePaths } from '@/components/sections/experience-paths';
import { GuestStories } from '@/components/sections/guest-stories';
import { ConciergeCta } from '@/components/sections/suites-section';
import { TrustStrip } from '@/components/sections/trust-strip';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/ui/page-header';

export const metadata: Metadata = {
  title: 'Experiences',
  description:
    'Choose an intention — a solo reset or a shared retreat — and we will guide you to the suites, rituals, and packages that fit your escape.',
  alternates: { canonical: '/experiences' },
};

export default function ExperiencesPage() {
  return (
    <>
      <Container className="pt-10 md:pt-14">
        <PageHeader
          folio="04"
          title="Experiences"
          description="Choose an intention, and we will guide you to the suites, rituals, and packages that fit your escape."
        />
      </Container>

      <ExperiencePaths />
      <TrustStrip />
      <GuestStories />
      <ConciergeCta />
    </>
  );
}
