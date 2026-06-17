'use client'

import Link from 'next/link'
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
    </div>
  )
}

export default function HousekeepingPage() {
  const dashboard = useQuery(housekeepingQueries.dashboard())
  const tasks = useQuery(housekeepingQueries.tasks({ limit: '10' }))

  const isLoading = dashboard.isLoading || tasks.isLoading
  const error = dashboard.error || tasks.error

  if (isLoading) return <Spinner />

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
        {error instanceof Error ? error.message : 'Failed to load housekeeping data'}
      </div>
    )
  }

  const stats = dashboard.data ?? {}
  const statEntries = Object.entries(stats).filter(
    ([, value]) => typeof value === 'number' || typeof value === 'string',
  )
  const taskList = (tasks.data ?? []) as HousekeepingTask[]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Housekeeping</h1>
          <p className="text-sm text-gray-500">Room cleaning and maintenance tasks</p>
        </div>
        <Link href="/staff/housekeeping/tasks">
          <Button variant="outline">All Tasks</Button>
        </Link>
      </div>

      {statEntries.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statEntries.slice(0, 8).map(([key, value]) => (
            <Card key={key}>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{String(value)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {taskList.length === 0 ? (
            <p className="text-sm text-gray-500">No tasks found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taskList.map((task) => (
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
                    <TableCell>
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
        </CardContent>
      </Card>
    </div>
  )
}
