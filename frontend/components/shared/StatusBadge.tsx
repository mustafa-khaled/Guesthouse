import { Badge } from '@/components/ui/badge'
import type { BookingStatus, RoomStatus } from '@/types'

const bookingVariants: Record<
  BookingStatus,
  'default' | 'success' | 'warning' | 'danger' | 'info'
> = {
  pending: 'warning',
  confirmed: 'info',
  'checked-in': 'success',
  'checked-out': 'default',
  cancelled: 'danger',
  'no-show': 'danger',
}

const roomVariants: Record<
  RoomStatus,
  'default' | 'success' | 'warning' | 'danger' | 'info'
> = {
  dirty: 'warning',
  clean: 'info',
  inspected: 'success',
  maintenance: 'danger',
  'out-of-order': 'danger',
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge variant={bookingVariants[status] || 'default'}>
      {status.replace('-', ' ')}
    </Badge>
  )
}

export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  return (
    <Badge variant={roomVariants[status] || 'default'}>
      {status.replace('-', ' ')}
    </Badge>
  )
}
