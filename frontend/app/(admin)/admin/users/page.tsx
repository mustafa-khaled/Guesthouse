'use client'

import { useQuery } from '@tanstack/react-query'
import { adminQueries } from '@/queries/admin.queries'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Spinner from '@/components/Spinner'
import { formatDate, getId } from '@/lib/utils'
import type { Role, User } from '@/types'

const roleVariant: Record<Role, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  user: 'default',
  viewer: 'default',
  editor: 'info',
  moderator: 'warning',
  admin: 'success',
}

export default function AdminUsersPage() {
  const { data, isLoading, isError, error } = useQuery(adminQueries.users())

  if (isLoading) return <Spinner />

  if (isError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
        {error instanceof Error ? error.message : 'Failed to load users'}
      </div>
    )
  }

  const users = (data ?? []) as User[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500">Manage system users and roles</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-sm text-gray-500">No users found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={getId(user)}>
                    <TableCell className="font-medium">
                      {user.name || '—'}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={roleVariant[user.role] || 'default'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isEmailVerified ? 'success' : 'warning'}>
                        {user.isEmailVerified ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">{user.authProvider}</TableCell>
                    <TableCell>
                      {user.createdAt ? formatDate(user.createdAt) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
