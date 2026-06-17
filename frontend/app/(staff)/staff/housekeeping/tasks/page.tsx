'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { housekeepingQueries } from '@/queries/staff.queries'
import { housekeepingMutations } from '@/mutations/bookings.mutations'
import { Button } from '@/components/ui/button'
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
import { formatDate, getId, getRefLabel } from '@/lib/utils'
import type { HousekeepingTask } from '@/types'

const statusVariant: Record<
  HousekeepingTask['status'],
  'default' | 'success' | 'warning' | 'danger' | 'info'
> = {
  pending: 'warning',
  'in-progress': 'info',
  completed: 'success',
  verified: 'success',
  cancelled: 'danger',
}

function TaskActions({ task }: { task: HousekeepingTask }) {
  const queryClient = useQueryClient()
  const taskId = getId(task)

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['housekeeping'] })
  }

  const completeMutation = useMutation({
    ...housekeepingMutations.complete(),
    onSuccess: () => {
      toast.success('Task completed')
      invalidate()
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : 'Failed to complete task'),
  })

  const statusMutation = useMutation({
    ...housekeepingMutations.updateStatus(),
    onSuccess: () => {
      toast.success('Status updated')
      invalidate()
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : 'Failed to update status'),
  })

  const isPending = completeMutation.isPending || statusMutation.isPending

  return (
    <div className="flex flex-wrap gap-2">
      {task.status !== 'completed' && task.status !== 'verified' && (
        <Button
          size="sm"
          disabled={isPending}
          onClick={() => completeMutation.mutate(taskId)}
        >
          Complete
        </Button>
      )}
      {task.status === 'pending' && (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() =>
            statusMutation.mutate({ id: taskId, status: 'in-progress' })
          }
        >
          Start
        </Button>
      )}
      {task.status === 'in-progress' && (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() =>
            statusMutation.mutate({ id: taskId, status: 'pending' })
          }
        >
          Reset
        </Button>
      )}
    </div>
  )
}

export default function HousekeepingTasksPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const params: Record<string, string> = { limit: '50' }
  if (statusFilter) params.status = statusFilter

  const { data, isLoading, isError, error } = useQuery(
    housekeepingQueries.tasks(params),
  )

  if (isLoading) return <Spinner />

  if (isError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
        {error instanceof Error ? error.message : 'Failed to load tasks'}
      </div>
    )
  }

  const tasks = (data ?? []) as HousekeepingTask[]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/staff/housekeeping"
            className="text-sm text-green-700 hover:underline"
          >
            &larr; Back to dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">All Tasks</h1>
        </div>
        <select
          className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="verified">Verified</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tasks ({tasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <p className="text-sm text-gray-500">No tasks match your filters.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={getId(task)}>
                    <TableCell>{getRefLabel(task.roomId as never)}</TableCell>
                    <TableCell className="capitalize">{task.type}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[task.status] || 'default'}>
                        {task.status.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">
                      {task.priority || 'normal'}
                    </TableCell>
                    <TableCell>{getRefLabel(task.assignedTo as never)}</TableCell>
                    <TableCell>
                      {task.dueDate ? formatDate(task.dueDate) : '—'}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-gray-500">
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
        </CardContent>
      </Card>
    </div>
  )
}
