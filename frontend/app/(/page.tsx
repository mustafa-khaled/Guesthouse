import { backendFetchApi } from "@/lib/api/server";
import type { Property, PaginatedResponse } from "@/types";
import { FaqSection } from "@/components/sections/faq-section";
import { Hero } from "@/components/sections/hero";
import {
  ConciergeCta,
  SuitesSection,
} from "@/components/sections/suites-section";
import { SpaSection } from "@/components/sections/spa-section";
import { GuestStories } from "@/components/sections/guest-stories";
import { TrustStrip } from "@/components/sections/trust-strip";
import { WellnessPackages } from "@/components/sections/wellness-packages";
import { ExperiencePaths } from "@/components/sections/experience-paths";

export default async function HomePage() {
  let properties: Property[] = [];
  try {
    const res =
      await backendFetchApi<PaginatedResponse<Property>>("/?limit=12");
    properties = res.data;
  } catch {
    properties = [];
  }

  return (
    <>
      <Hero />
      <ExperiencePaths />
      <SuitesSection />
      <WellnessPackages />
      <SpaSection />
      <GuestStories />
      <TrustStrip />
      <ConciergeCta />
      <FaqSection />
    </>
  );
}
