'use client'

import { useQuery } from '@tanstack/react-query'
import { adminQueries } from '@/queries/admin.queries'
import { Card, CardContent } from '@/components/ui/card'
import Spinner from '@/components/Spinner'

export default function AdminDashboardPage() {
  const { data, isLoading, isError, error } = useQuery(
    adminQueries.managerDashboard(),
  )

  if (isLoading) return <Spinner />

  if (isError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
        {error instanceof Error ? error.message : 'Failed to load dashboard'}
      </div>
    )
  }

  const stats = data ?? {}
  const statEntries = Object.entries(stats).filter(
    ([, value]) =>
      typeof value === 'number' ||
      typeof value === 'string' ||
      typeof value === 'boolean',
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of property performance</p>
      </div>

      {statEntries.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            No dashboard data available yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {statEntries.map(([key, value]) => (
            <Card key={key}>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
