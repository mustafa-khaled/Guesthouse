'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const reports = [
  {
    type: 'occupancy',
    title: 'Occupancy Report',
    description: 'Room occupancy rates and availability trends',
  },
  {
    type: 'revenue',
    title: 'Revenue Report',
    description: 'Revenue breakdown by period and source',
  },
  {
    type: 'room-type-performance',
    title: 'Room Type Performance',
    description: 'Performance metrics by room category',
  },
  {
    type: 'source-analysis',
    title: 'Source Analysis',
    description: 'Booking channel and source breakdown',
  },
  {
    type: 'cancellation-analysis',
    title: 'Cancellation Analysis',
    description: 'Cancellation rates and reasons',
  },
  {
    type: 'daily-summary',
    title: 'Daily Summary',
    description: 'Daily operations and financial summary',
  },
]

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500">Analytics and business intelligence</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Link key={report.type} href={`/admin/reports/${report.type}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-base">{report.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">{report.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
