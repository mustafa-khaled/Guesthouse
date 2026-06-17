'use client'

import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface SearchBarProps {
  defaultCheckIn?: string
  defaultCheckOut?: string
  defaultAdults?: number
  defaultChildren?: number
  action?: string
}

export function SearchBar({
  defaultCheckIn = '',
  defaultCheckOut = '',
  defaultAdults = 2,
  defaultChildren = 0,
  action = '/search',
}: SearchBarProps) {
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const params = new URLSearchParams()
    for (const [key, value] of fd.entries()) {
      if (value) params.set(key, String(value))
    }
    router.push(`${action}?${params.toString()}`)
  }

  return (
    <Card className="mx-auto max-w-4xl shadow-lg">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-5">
          <div>
            <Label htmlFor="checkIn">Check-in</Label>
            <Input
              id="checkIn"
              name="checkIn"
              type="date"
              defaultValue={defaultCheckIn}
              required
            />
          </div>
          <div>
            <Label htmlFor="checkOut">Check-out</Label>
            <Input
              id="checkOut"
              name="checkOut"
              type="date"
              defaultValue={defaultCheckOut}
              required
            />
          </div>
          <div>
            <Label htmlFor="adults">Adults</Label>
            <Input
              id="adults"
              name="adults"
              type="number"
              min={1}
              defaultValue={defaultAdults}
            />
          </div>
          <div>
            <Label htmlFor="children">Children</Label>
            <Input
              id="children"
              name="children"
              type="number"
              min={0}
              defaultValue={defaultChildren}
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full">
              Search
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
