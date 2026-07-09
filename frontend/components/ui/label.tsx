import { cn } from '@/lib/utils';

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, ...props }: LabelProps) {
  return <label className={cn('text-sm font-medium text-gray-700', className)} {...props} />;
}
