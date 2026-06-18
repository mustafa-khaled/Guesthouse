import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";

const suites = [
  {
    name: "Horizon Suite",
    description:
      "Wake to horizon light and the rhythm of the tide from your private terrace.",
    detail: "King bed · Terrace · Soaking tub",
  },
  {
    name: "Garden Sanctuary",
    description:
      "Floor-to-ceiling garden views, natural textures, and the hush of greenery.",
    detail: "Queen bed · Garden view · Rain shower",
  },
  {
    name: "Wellness Loft",
    description:
      "A spacious retreat with meditation nook and in-room wellness amenities.",
    detail: "King bed · Loft · Wellness bar",
  },
];

export function SuitesSection() {
  return (
    <Section
      id="suites"
      variant="divider"
      eyebrow="Signature spaces"
      title="Sanctuaries designed for rest"
      description="Each suite is a quiet composition of light, texture, and unhurried comfort."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {suites.map((suite) => (
          <Card key={suite.name} className="overflow-hidden p-0">
            <div
              className="h-44 bg-gradient-to-br from-matcha-brand-medium/50 to-matcha-brand/30"
              role="img"
              aria-label={`${suite.name} interior`}
            />
            <div className="p-6 md:p-8">
              <h3 className="font-serif text-2xl font-medium text-matcha-heading">
                {suite.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-matcha-body">
                {suite.description}
              </p>
              <p className="mt-4 text-xs uppercase tracking-wide text-matcha-brand">
                {suite.detail}
              </p>
              <Button variant="ghost" href="#book" className="mt-4">
                View suite →
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

export function ConciergeCta() {
  return (
    <section className="border-t border-matcha-border py-16 md:py-20">
      <Container>
        <Card tint className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-matcha-brand">
            Personal planning
          </p>
          <h2 className="mt-3 font-serif text-3xl font-medium text-matcha-heading md:text-4xl">
            Not sure yet? Let us plan your stay.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-matcha-body">
            Tell us what you&apos;re celebrating — our concierge will suggest the
            perfect suite, spa rituals, and package for your escape.
          </p>
          <Button href="#" className="mt-8">
            Speak with concierge
          </Button>
        </Card>
      </Container>
    </section>
  );
}
