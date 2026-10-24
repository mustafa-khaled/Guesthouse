import { cn } from '@/lib/utils';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'border-line bg-raised/60 flex flex-col items-center rounded-[4px] border border-dashed px-6 py-14 text-center',
        className,
      )}
      {...props}
    >
      {icon && <div className="text-brand/60 mb-4 [&_svg]:h-6 [&_svg]:w-6">{icon}</div>}
      <p className="text-ink font-serif text-xl">{title}</p>
      {description && (
        <p className="text-muted mt-2 max-w-sm text-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
