import { cn } from '@/lib/utils'

type ContainerProps<T extends keyof JSX.IntrinsicElements = 'div'> =
  React.HTMLAttributes<HTMLElement> & {
    as?: T
  }

export function Container<T extends keyof JSX.IntrinsicElements = 'div'>({
  as,
  className,
  ...props
}: ContainerProps<T>) {
  const Component = as || 'div'
  return (
    <Component
      className={cn('mx-auto max-w-7xl px-6 md:px-8', className)}
      {...props}
    />
  )
}
