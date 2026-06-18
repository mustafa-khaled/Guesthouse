import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { packages } from "@/lib/content";
import { cn } from "@/lib/utils";

export function WellnessPackages() {
  return (
    <Section
      id="packages"
      variant="divider"
      eyebrow="Wellness packages"
      title="Curated retreats for every rhythm"
      description="Three tiers of renewal — from a gentle reset to a complete transformation."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {packages.map((pkg) => (
          <Card
            key={pkg.name}
            className={cn(
              "flex h-full flex-col",
              pkg.highlighted && "border-matcha-brand ring-1 ring-matcha-brand/20",
            )}
          >
            {pkg.highlighted && (
              <span className="mb-4 inline-flex self-start rounded-[4px] bg-matcha-brand px-3 py-1 text-xs font-medium uppercase tracking-wide text-matcha-white">
                Recommended
              </span>
            )}
            <h3 className="font-serif text-2xl font-medium text-matcha-heading">
              {pkg.name}
            </h3>
            <p className="mt-2 text-sm text-matcha-brand">{pkg.duration}</p>
            <p className="mt-4 font-serif text-3xl font-medium text-matcha-heading">
              {pkg.price}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-matcha-body">
              {pkg.description}
            </p>
            <ul className="mt-6 flex-1 space-y-2 border-t border-matcha-border pt-6">
              {pkg.features.map((feature) => (
                <li key={feature} className="flex gap-2 text-sm text-matcha-body">
                  <span aria-hidden className="text-matcha-brand">
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              href="#book"
              variant={pkg.highlighted ? "primary" : "secondary"}
              className="mt-8 w-full"
            >
              View package
            </Button>
          </Card>
        ))}
      </div>
    </Section>
  );
}
