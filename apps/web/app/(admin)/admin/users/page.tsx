'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Users } from 'lucide-react';
import { adminQueries } from '@/queries/admin.queries';
import { adminUserMutations } from '@/features/admin/mutations';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/ui/container';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { Select } from '@/components/ui/select';
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

  const users = (data ?? []) as User[];

  return (
    <Container className="max-w-none px-0 sm:px-0 lg:px-0">
      <PageHeader
        folio="—"
        title="Users"
        description="Everyone with access to the house — guests, staff, and the people who keep it running."
      />

      {isError && (
        <Alert variant="error" className="mt-8" title="We could not load users">
          {error instanceof Error ? error.message : 'Please refresh the page and try again.'}
        </Alert>
      )}

      <div className="mt-8">
        {users.length === 0 ? (
          <EmptyState
            icon={<Users />}
            title="No users yet"
            description="New accounts will appear here as guests register and staff are invited."
          />
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
                  <TableCell className="text-ink font-medium">{user.name || '—'}</TableCell>
                  <TableCell className="text-muted">{user.email}</TableCell>
                  <TableCell>
                    <Select
                      aria-label={`Role for ${user.name || user.email}`}
                      className="min-h-9 max-w-36 py-1 text-xs"
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
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isEmailVerified ? 'success' : 'warning'} dot>
                      {user.isEmailVerified ? 'Verified' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted capitalize">{user.authProvider}</TableCell>
                  <TableCell className="text-muted tabular">
                    {user.createdAt ? formatDate(user.createdAt) : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </Container>
  );
}
