import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  title: string;
  description?: string;
  folio?: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  folio,
  backHref,
  backLabel = 'Back',
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'border-line flex flex-col gap-6 border-b pb-8 md:flex-row md:items-end md:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="focus-ring text-muted hover:text-brand mb-5 inline-flex items-center gap-2 text-sm transition-colors"
          >
            <ArrowLeft aria-hidden className="h-4 w-4" strokeWidth={1.5} />
            {backLabel}
          </Link>
        )}
        {folio && (
          <p aria-hidden className="text-brand/35 tabular mb-2 font-serif text-2xl leading-none">
            {folio}
          </p>
        )}
        <h1 className="text-title text-balance">{title}</h1>
        {description && (
          <p className="text-muted mt-3 max-w-2xl text-pretty text-base leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}
