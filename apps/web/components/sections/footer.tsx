import { Container } from '@/components/ui/container';
import { footerLinks, site } from '@/lib/content';

export function Footer() {
  return (
    <footer className="border-matcha-border bg-matcha-surface border-t py-16">
      <Container>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-matcha-heading font-serif text-2xl font-medium">{site.name}</p>
            <p className="text-matcha-body mt-3 max-w-xs text-sm leading-relaxed">
              A warm sanctuary for rest, renewal, and unhurried luxury.
            </p>
            <div className="text-matcha-body mt-6 space-y-1 text-sm">
              <p>{site.phone}</p>
              <p>{site.email}</p>
            </div>
          </div>

          <div>
            <h3 className="text-matcha-heading text-sm font-medium uppercase tracking-wide">
              Stay
            </h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.stay.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-matcha-body hover:text-matcha-brand text-sm">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-matcha-heading text-sm font-medium uppercase tracking-wide">
              Wellness
            </h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.wellness.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-matcha-body hover:text-matcha-brand text-sm">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-matcha-heading text-sm font-medium uppercase tracking-wide">
              Help
            </h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.help.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-matcha-body hover:text-matcha-brand text-sm">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-matcha-border text-matcha-body mt-12 flex flex-col gap-3 border-t pt-8 text-sm md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p>Built with TypeUI Matcha · Next.js</p>
        </div>
      </Container>
    </footer>
  );
}
