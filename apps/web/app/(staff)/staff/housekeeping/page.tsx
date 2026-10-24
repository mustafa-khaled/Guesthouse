'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Sparkles } from 'lucide-react';
import { housekeepingQueries } from '@/queries/staff.queries';
import { housekeepingMutations } from '@/mutations/bookings.mutations';
import { useSelectedProperty } from '@/features/properties/use-selected-property';
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
import { formatStatLabel, StatGrid } from '@/components/ui/stat-grid';
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
    </div>
  );
}

export default function HousekeepingPage() {
  const {
    propertyId,
    setPropertyId,
    properties,
    isLoading: propertiesLoading,
  } = useSelectedProperty();
  const dashboard = useQuery({
    ...housekeepingQueries.dashboard(propertyId),
    enabled: !!propertyId,
  });
  const tasks = useQuery(housekeepingQueries.tasks({ limit: '10' }));

  const isLoading = propertiesLoading || dashboard.isLoading || tasks.isLoading;
  const error = dashboard.error || tasks.error;

  if (isLoading) return <Spinner />;

  const stats = dashboard.data ?? {};
  const statItems = Object.entries(stats)
    .filter(([, value]) => typeof value === 'number')
    .map(([key, value]) => ({ label: formatStatLabel(key), value: String(value) }));
  const taskList = (tasks.data ?? []) as HousekeepingTask[];

  return (
    <Container className="max-w-none px-0 sm:px-0 lg:px-0">
      <PageHeader
        folio="—"
        title="Housekeeping"
        description="Room cleaning and upkeep. The board below is what the floor team works from today."
        actions={
          <div className="flex flex-wrap items-end gap-3">
            {properties.length > 1 && (
              <div className="w-56">
                <Select
                  aria-label="Selected property"
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                >
                  {properties.map((property) => (
                    <option key={getId(property)} value={getId(property)}>
                      {property.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}
            <Button href="/staff/housekeeping/tasks" variant="secondary">
              All tasks
            </Button>
          </div>
        }
      />

      {error && (
        <Alert variant="error" className="mt-8" title="We could not load housekeeping">
          {error instanceof Error ? error.message : 'Please refresh the page and try again.'}
        </Alert>
      )}

      <StatGrid items={statItems} className="mt-10" />

      <section className="border-line mt-10 border-t pt-6" aria-labelledby="recent-tasks">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="recent-tasks" className="font-serif text-xl leading-snug">
            Recent tasks
          </h2>
          <span className="text-muted tabular text-xs">{taskList.length} shown</span>
        </div>

        <div className="mt-5">
          {taskList.length === 0 ? (
            <EmptyState
              icon={<Sparkles />}
              title="Nothing on the board"
              description="When a room needs attention, the task will appear here with its due date."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead className="text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taskList.map((task) => (
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
                    <TableCell className="text-muted tabular">
                      {task.dueDate ? formatDate(task.dueDate) : '—'}
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
      </section>
    </Container>
  );
}
