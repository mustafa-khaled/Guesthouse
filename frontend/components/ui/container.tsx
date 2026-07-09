import { cn } from '@/lib/utils';

type ContainerElement = 'div' | 'nav' | 'section' | 'main' | 'article';

type ContainerProps = React.HTMLAttributes<HTMLElement> & {
  as?: ContainerElement;
};

export function Container({ as = 'div', className, ...props }: ContainerProps) {
  const Component = as;

  return <Component className={cn('mx-auto max-w-7xl px-6 md:px-8', className)} {...props} />;
}
