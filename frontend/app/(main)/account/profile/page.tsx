'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { clientFetch } from '@/lib/api/client'
import type { Guest } from '@/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Spinner from '@/components/Spinner'

const guestProfileQuery = {
  queryKey: ['guest-profile'] as const,
  queryFn: () => clientFetch<{ data: Guest }>('/v1/user/me/guest-profile'),
}

export default function GuestProfilePage() {
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useQuery(guestProfileQuery)

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationality: '',
  })

  useEffect(() => {
    if (data?.data) {
      const guest = data.data
      setForm({
        firstName: guest.firstName ?? '',
        lastName: guest.lastName ?? '',
        email: guest.email ?? '',
        phone: guest.phone ?? '',
        nationality: guest.nationality ?? '',
      })
    }
  }, [data])

  const updateMutation = useMutation({
    mutationFn: (body: typeof form) =>
      clientFetch<{ data: Guest }>('/v1/user/me/guest-profile', {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      toast.success('Profile updated')
      queryClient.invalidateQueries({ queryKey: guestProfileQuery.queryKey })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-red-600">Unable to load guest profile.</p>
        <Link href="/account" className="mt-4 inline-block text-green-700">
          ← Back to account
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <Link
        href="/account"
        className="mb-6 inline-block text-sm text-green-700 hover:underline"
      >
        ← Back to account
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Guest profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              updateMutation.mutate(form)
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                id="nationality"
                value={form.nationality}
                onChange={(e) =>
                  setForm({ ...form, nationality: e.target.value })
                }
              />
            </div>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
