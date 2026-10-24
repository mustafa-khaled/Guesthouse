import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

const variants = {
  error: {
    className: 'border-danger/20 bg-danger-tint text-danger',
    icon: AlertCircle,
    role: 'alert' as const,
  },
  success: {
    className: 'border-success/20 bg-success-tint text-success',
    icon: CheckCircle2,
    role: 'status' as const,
  },
  warning: {
    className: 'border-warning/20 bg-warning-tint text-warning',
    icon: TriangleAlert,
    role: 'alert' as const,
  },
  info: {
    className: 'border-info/20 bg-info-tint text-info',
    icon: Info,
    role: 'status' as const,
  },
};

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variants;
  title?: string;
}

export function Alert({ className, variant = 'info', title, children, ...props }: AlertProps) {
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div
      role={config.role}
      className={cn('flex gap-3 rounded-[4px] border p-4 text-sm', config.className, className)}
      {...props}
    >
      <Icon aria-hidden className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
      <div className="min-w-0 space-y-1">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className="leading-relaxed">{children}</div>}
      </div>
    </div>
  );
}
