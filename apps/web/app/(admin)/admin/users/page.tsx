'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminQueries } from '@/queries/admin.queries';
import { adminUserMutations } from '@/features/admin/mutations';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Spinner from '@/components/Spinner';
import { formatDate, getId } from '@/lib/utils';
import type { Role, User } from '@/types';

const roleVariant: Record<Role, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  user: 'default',
  viewer: 'default',
  editor: 'info',
  moderator: 'warning',
  admin: 'success',
};

const roles: Role[] = ['user', 'viewer', 'editor', 'moderator', 'admin'];

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useQuery(adminQueries.users());

  const roleMutation = useMutation({
    ...adminUserMutations.updateRole(),
    onSuccess: () => {
      toast.success('Role updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Update failed'),
  });

  if (isLoading) return <Spinner />;

  if (isError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
        {error instanceof Error ? error.message : 'Failed to load users'}
      </div>
    );
  }

  const users = (data ?? []) as User[];

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
                    <TableCell className="font-medium">{user.name || '—'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <select
                        className="rounded border border-gray-300 px-2 py-1 text-sm"
                        value={user.role}
                        onChange={(e) =>
                          roleMutation.mutate({
                            id: getId(user),
                            role: e.target.value as Role,
                          })
                        }
                      >
                        {roles.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isEmailVerified ? 'success' : 'warning'}>
                        {user.isEmailVerified ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">{user.authProvider}</TableCell>
                    <TableCell>{user.createdAt ? formatDate(user.createdAt) : '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
