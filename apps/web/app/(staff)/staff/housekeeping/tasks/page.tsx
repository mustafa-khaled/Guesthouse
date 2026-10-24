'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Sparkles } from 'lucide-react';
import { housekeepingQueries } from '@/queries/staff.queries';
import { housekeepingMutations } from '@/mutations/bookings.mutations';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { formatDate, getId, getRefLabel } from '@/lib/utils';
import type { HousekeepingTask } from '@/types';

const statusVariant: Record<
  HousekeepingTask['status'],
  'default' | 'success' | 'warning' | 'danger' | 'info'
> = {
  pending: 'warning',
  'in-progress': 'info',
  completed: 'success',
  verified: 'success',
  cancelled: 'danger',
};

function TaskActions({ task }: { task: HousekeepingTask }) {
  const queryClient = useQueryClient();
  const taskId = getId(task);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['housekeeping'] });
  };

  const completeMutation = useMutation({
    ...housekeepingMutations.complete(),
    onSuccess: () => {
      toast.success('Task completed');
      invalidate();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to complete task'),
  });

  const statusMutation = useMutation({
    ...housekeepingMutations.updateStatus(),
    onSuccess: () => {
      toast.success('Status updated');
      invalidate();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to update status'),
  });

  const isPending = completeMutation.isPending || statusMutation.isPending;

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {task.status !== 'completed' && task.status !== 'verified' && (
        <Button size="sm" disabled={isPending} onClick={() => completeMutation.mutate(taskId)}>
          Complete
        </Button>
      )}
      {task.status === 'pending' && (
        <Button
          size="sm"
          variant="ghost"
          disabled={isPending}
          onClick={() => statusMutation.mutate({ id: taskId, status: 'in-progress' })}
        >
          Start
        </Button>
      )}
      {task.status === 'in-progress' && (
        <Button
          size="sm"
          variant="ghost"
          disabled={isPending}
          onClick={() => statusMutation.mutate({ id: taskId, status: 'pending' })}
        >
          Reset
        </Button>
      )}
    </div>
  );
}

export default function HousekeepingTasksPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const params: Record<string, string> = { limit: '50' };
  if (statusFilter) params.status = statusFilter;

  const { data, isLoading, isError, error } = useQuery(housekeepingQueries.tasks(params));

  if (isLoading) return <Spinner />;

  const tasks = (data ?? []) as HousekeepingTask[];

  return (
    <Container className="max-w-none px-0 sm:px-0 lg:px-0">
      <PageHeader
        folio="—"
        title="All tasks"
        description="Every cleaning and upkeep task on the board, filtered by where it stands."
        backHref="/staff/housekeeping"
        backLabel="Housekeeping"
        actions={
          <div className="w-48">
            <Select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="verified">Verified</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>
        }
      />

      {isError && (
        <Alert variant="error" className="mt-8" title="We could not load tasks">
          {error instanceof Error ? error.message : 'Please refresh the page and try again.'}
        </Alert>
      )}

      <div className="mt-8">
        <div className="border-line flex flex-wrap items-baseline justify-between gap-3 border-b pb-3">
          <h2 className="font-serif text-xl leading-snug">Tasks</h2>
          <span className="text-muted tabular text-xs">{tasks.length} shown</span>
        </div>

        <div className="mt-6">
          {tasks.length === 0 ? (
            <EmptyState
              icon={<Sparkles />}
              title="No tasks match this filter"
              description="Try another status, or clear the filter to see the whole board."
              action={
                statusFilter ? (
                  <Button variant="secondary" onClick={() => setStatusFilter('')}>
                    Clear filter
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assigned to</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={getId(task)}>
                    <TableCell className="text-ink font-medium">
                      {getRefLabel(task.roomId as never)}
                    </TableCell>
                    <TableCell className="text-muted capitalize">{task.type}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[task.status] || 'default'} dot>
                        {task.status.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted capitalize">
                      {task.priority || 'normal'}
                    </TableCell>
                    <TableCell className="text-muted">
                      {getRefLabel(task.assignedTo as never)}
                    </TableCell>
                    <TableCell className="text-muted tabular">
                      {task.dueDate ? formatDate(task.dueDate) : '—'}
                    </TableCell>
                    <TableCell className="text-muted max-w-[200px] truncate">
                      {task.notes || '—'}
                    </TableCell>
                    <TableCell>
                      <TaskActions task={task} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </Container>
  );
}
