'use client'

import Link from 'next/link'
import { use, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { propertyQueries } from '@/queries/properties.queries'
import { clientFetch } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Spinner from '@/components/Spinner'
import type { Property } from '@/types'

export default function AdminPropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const queryClient = useQueryClient()

  const { data: property, isLoading, isError, error } = useQuery(
    propertyQueries.detail(id),
  )

  const [form, setForm] = useState<Partial<Property>>({})

  const current = { ...property, ...form }

  const updateMutation = useMutation({
    mutationFn: (body: Partial<Property>) =>
      clientFetch<{ data: Property }>(`/v1/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      toast.success('Property updated')
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'properties'] })
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : 'Failed to update property'),
  })

  if (isLoading) return <Spinner />

  if (isError || !property) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
        {error instanceof Error ? error.message : 'Property not found'}
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate({
      name: current.name,
      description: current.description,
      starRating: current.starRating,
      isActive: current.isActive,
      contact: current.contact,
      address: current.address,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/properties"
          className="text-sm text-green-700 hover:underline"
        >
          &larr; Back to properties
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">{property.name}</h1>
        <p className="text-sm text-gray-500">Edit property details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                className="mt-1"
                value={current.name ?? ''}
                onChange={(e) => setForm((f: Partial<Property>) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                className="mt-1"
                rows={4}
                value={current.description ?? ''}
                onChange={(e) =>
                  setForm((f: Partial<Property>) => ({ ...f, description: e.target.value }))
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  className="mt-1"
                  value={current.address?.city ?? ''}
                  onChange={(e) =>
                    setForm((f: Partial<Property>) => ({
                      ...f,
                      address: { ...property.address, ...f.address, city: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  className="mt-1"
                  value={current.address?.country ?? ''}
                  onChange={(e) =>
                    setForm((f: Partial<Property>) => ({
                      ...f,
                      address: {
                        ...property.address,
                        ...f.address,
                        country: e.target.value,
                      },
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  className="mt-1"
                  value={current.contact?.phone ?? ''}
                  onChange={(e) =>
                    setForm((f: Partial<Property>) => ({
                      ...f,
                      contact: { ...property.contact, ...f.contact, phone: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  className="mt-1"
                  value={current.contact?.email ?? ''}
                  onChange={(e) =>
                    setForm((f: Partial<Property>) => ({
                      ...f,
                      contact: { ...property.contact, ...f.contact, email: e.target.value },
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="starRating">Star Rating</Label>
                <Input
                  id="starRating"
                  type="number"
                  min={1}
                  max={5}
                  className="mt-1"
                  value={current.starRating ?? ''}
                  onChange={(e) =>
                    setForm((f: Partial<Property>) => ({
                      ...f,
                      starRating: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={current.isActive !== false}
                    onChange={(e) =>
                      setForm((f: Partial<Property>) => ({ ...f, isActive: e.target.checked }))
                    }
                  />
                  Active listing
                </label>
              </div>
            </div>

            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
