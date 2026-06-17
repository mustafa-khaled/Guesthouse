import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getId(doc: { id?: string; _id?: string } | string | undefined): string {
  if (!doc) return ''
  if (typeof doc === 'string') return doc
  return doc.id ?? doc._id ?? ''
}

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function getRefLabel(
  ref: string | Record<string, unknown> | undefined,
): string {
  if (!ref) return '—'
  if (typeof ref === 'string') return ref
  if (ref.firstName && ref.lastName) {
    return `${ref.firstName} ${ref.lastName}`
  }
  if (ref.name) return String(ref.name)
  if (ref.number) return String(ref.number)
  if (ref.confirmationNumber) return String(ref.confirmationNumber)
  return getId(ref as { id?: string; _id?: string }) || '—'
}
