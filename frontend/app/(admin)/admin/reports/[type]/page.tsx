'use client'

import Link from 'next/link'
import { use, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminQueries } from '@/queries/admin.queries'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Spinner from '@/components/Spinner'
import { formatCurrency, formatDate } from '@/lib/utils'

const reportTitles: Record<string, string> = {
  occupancy: 'Occupancy Report',
  revenue: 'Revenue Report',
  'room-type-performance': 'Room Type Performance',
  'source-analysis': 'Source Analysis',
  'cancellation-analysis': 'Cancellation Analysis',
  'daily-summary': 'Daily Summary',
}

function formatCellValue(value: unknown): string {
  if (value == null) return '—'
  if (typeof value === 'number') return value.toLocaleString()
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return formatDate(value)
  }
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function ReportDataView({ data }: { data: unknown }) {
  if (data == null) {
    return <p className="text-sm text-gray-500">No report data available.</p>
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <p className="text-sm text-gray-500">No records in this report.</p>
    }

    const columns = Object.keys(data[0] as Record<string, unknown>)

    return (
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col} className="capitalize">
                {col.replace(/([A-Z])/g, ' $1').trim()}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => (
            <TableRow key={i}>
              {columns.map((col) => (
                <TableCell key={col}>
                  {formatCellValue((row as Record<string, unknown>)[col])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  if (typeof data === 'object') {
    const entries = Object.entries(data as Record<string, unknown>)

    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map(([key, value]) => (
          <Card key={key}>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-500 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </p>
              <p className="mt-1 text-lg font-semibold text-gray-900">
                {typeof value === 'number' && key.toLowerCase().includes('revenue')
                  ? formatCurrency(value)
                  : formatCellValue(value)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return <p className="text-sm text-gray-900">{formatCellValue(data)}</p>
}

export default function AdminReportTypePage({
  params,
}: {
  params: Promise<{ type: string }>
}) {
  const { type } = use(params)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const queryParams: Record<string, string> = {}
  if (startDate) queryParams.startDate = startDate
  if (endDate) queryParams.endDate = endDate

  const { data: response, isLoading, isError, error, refetch, isFetching } = useQuery({
    ...adminQueries.report(type, queryParams),
    enabled: !!type,
  })

  const reportData =
    response && typeof response === 'object' && 'data' in response
      ? (response as { data: unknown }).data
      : response

  const title = reportTitles[type] ?? type.replace(/-/g, ' ')

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/reports"
          className="text-sm text-green-700 hover:underline"
        >
          &larr; Back to reports
        </Link>
        <h1 className="mt-2 text-2xl font-bold capitalize text-gray-900">{title}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                className="mt-1"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                className="mt-1"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button disabled={isFetching} onClick={() => refetch()}>
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
          {error instanceof Error ? error.message : 'Failed to load report'}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            <ReportDataView data={reportData} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
