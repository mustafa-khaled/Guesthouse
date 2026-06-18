import { Container } from "@/components/ui/container";
import { footerLinks, site } from "@/lib/content";

export function Footer() {
  return (
    <footer className="border-t border-matcha-border bg-matcha-surface py-16">
      <Container>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-serif text-2xl font-medium text-matcha-heading">
              {site.name}
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-matcha-body">
              A warm sanctuary for rest, renewal, and unhurried luxury.
            </p>
            <div className="mt-6 space-y-1 text-sm text-matcha-body">
              <p>{site.phone}</p>
              <p>{site.email}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium uppercase tracking-wide text-matcha-heading">
              Stay
            </h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.stay.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-matcha-body hover:text-matcha-brand"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium uppercase tracking-wide text-matcha-heading">
              Wellness
            </h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.wellness.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-matcha-body hover:text-matcha-brand"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium uppercase tracking-wide text-matcha-heading">
              Help
            </h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.help.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-matcha-body hover:text-matcha-brand"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-matcha-border pt-8 text-sm text-matcha-body md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <p>Built with TypeUI Matcha · Next.js</p>
        </div>
      </Container>
    </footer>
  );
}
