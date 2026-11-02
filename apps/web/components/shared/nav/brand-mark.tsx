export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 32 32"
      className={className ?? 'text-brand h-7 w-7 shrink-0'}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="1.25"
        y="1.25"
        width="29.5"
        height="29.5"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <path
        d="M16 6.5c-4.6 0-7.4 3.3-7.4 7.8V25.5h14.8V14.3c0-4.5-2.8-7.8-7.4-7.8Z"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <path d="M16 24.5v-9.2" stroke="currentColor" strokeWidth="1.1" />
      <path d="M16 17.8c2.4 0 4-1.5 4-3.9-2.4 0-4 1.4-4 3.9Z" fill="currentColor" opacity="0.45" />
    </svg>
  );
}
