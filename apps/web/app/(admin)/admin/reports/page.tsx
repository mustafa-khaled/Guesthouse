import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { PageHeader } from '@/components/ui/page-header';

const reports = [
  {
    type: 'occupancy',
    title: 'Occupancy',
    description: 'Room occupancy rates and how availability moves across the season.',
  },
  {
    type: 'revenue',
    title: 'Revenue',
    description: 'Revenue broken down by period and booking source.',
  },
  {
    type: 'room-type-performance',
    title: 'Room type performance',
    description: 'Which categories fill first, and which need a second look.',
  },
  {
    type: 'source-analysis',
    title: 'Source analysis',
    description: 'Where bookings come from — direct, partner, and returning guests.',
  },
  {
    type: 'cancellation-analysis',
    title: 'Cancellation analysis',
    description: 'Cancellation rates, timing, and the patterns behind them.',
  },
  {
    type: 'daily-summary',
    title: 'Daily summary',
    description: 'A single-day operational and financial snapshot.',
  },
];

export default function AdminReportsPage() {
  return (
    <Container className="max-w-none px-0 sm:px-0 lg:px-0">
      <PageHeader
        folio="—"
        title="Reports"
        description="Six views of the business. Each one is calculated live from the same booking data you work with every day."
      />

      <div className="mt-10 grid gap-px sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Link
            key={report.type}
            href={`/admin/reports/${report.type}`}
            className="focus-ring border-line hover:bg-raised group flex flex-col justify-between gap-6 border-b px-1 py-6 transition-colors duration-200 sm:px-6 sm:odd:border-r"
          >
            <div>
              <h2 className="text-ink font-serif text-xl leading-snug">{report.title}</h2>
              <p className="text-muted mt-2 text-sm leading-relaxed">{report.description}</p>
            </div>
            <span className="text-brand inline-flex items-center gap-1.5 text-xs">
              Open report
              <ArrowUpRight
                aria-hidden
                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                strokeWidth={1.5}
              />
            </span>
          </Link>
        ))}
      </div>
    </Container>
  );
}
