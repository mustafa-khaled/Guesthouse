import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { footerLinks, site } from '@/lib/content';

const columns = [
  { title: 'Stay', links: footerLinks.stay },
  { title: 'Wellness', links: footerLinks.wellness },
  { title: 'Help', links: footerLinks.help },
];

function FooterLink({ href, label }: { href: string; label: string }) {
  const className = 'focus-ring text-muted hover:text-brand text-sm transition-colors duration-200';

  if (href.startsWith('#') || href.startsWith('mailto:')) {
    return (
      <a href={href} className={className}>
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="border-line bg-surface border-t">
      <Container className="py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <p className="text-ink font-serif text-3xl leading-none md:text-4xl">{site.name}</p>
            <p className="text-muted mt-5 max-w-xs text-sm leading-relaxed">{site.description}</p>

            <div className="text-muted mt-8 space-y-1.5 text-sm">
              <p>
                <a href={`tel:${site.phone.replace(/[^+\d]/g, '')}`} className="hover:text-brand">
                  {site.phone}
                </a>
              </p>
              <p>
                <a href={`mailto:${site.email}`} className="hover:text-brand">
                  {site.email}
                </a>
              </p>
              <p>{site.location}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-ink font-sans text-xs font-medium uppercase tracking-[0.16em]">
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.label}`}>
                      <FooterLink href={link.href} label={link.label} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-line text-muted mt-14 flex flex-col gap-3 border-t pt-6 text-xs md:mt-16 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p>Concierge replies within one business day.</p>
        </div>
      </Container>
    </footer>
  );
}
