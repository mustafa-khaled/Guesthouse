import { cn } from '@/lib/utils';

type ContainerElement = 'div' | 'nav' | 'section' | 'main' | 'article' | 'header' | 'footer';

type ContainerProps = React.HTMLAttributes<HTMLElement> & {
  as?: ContainerElement;
};

export function Container({ as = 'div', className, ...props }: ContainerProps) {
  const Component = as;

  return (
    <Component
      className={cn('mx-auto w-full max-w-[1240px] px-5 sm:px-8 lg:px-12', className)}
      {...props}
    />
  );
}
