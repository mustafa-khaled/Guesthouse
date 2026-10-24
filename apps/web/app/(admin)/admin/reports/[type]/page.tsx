'use client';

import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminQueries } from '@/queries/admin.queries';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { formatCurrency, formatDate } from '@/lib/utils';

const reportTitles: Record<string, string> = {
  occupancy: 'Occupancy report',
  revenue: 'Revenue report',
  'room-type-performance': 'Room type performance',
  'source-analysis': 'Source analysis',
  'cancellation-analysis': 'Cancellation analysis',
  'daily-summary': 'Daily summary',
};

function formatLabel(value: string) {
  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/[-_]/g, ' ')
    .trim()
    .replace(/^\w/, (char) => char.toUpperCase());
}

function formatCellValue(value: unknown): string {
  if (value == null) return '—';
  if (typeof value === 'number') return value.toLocaleString();
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return formatDate(value);
  }
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function ReportDataView({ data }: { data: unknown }) {
  if (data == null) {
    return (
      <EmptyState
        title="No report data"
        description="Adjust the filters above and apply them to see results."
      />
    );
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return (
        <EmptyState
          title="No records in this period"
          description="Try widening the date range or choosing another property."
        />
      );
    }

    const columns = Object.keys(data[0] as Record<string, unknown>);

    return (
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col}>{formatLabel(col)}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => (
            <TableRow key={i}>
              {columns.map((col) => (
                <TableCell key={col} className="tabular">
                  {formatCellValue((row as Record<string, unknown>)[col])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (typeof data === 'object') {
    const entries = Object.entries(data as Record<string, unknown>);
    const isMetric = (value: unknown) => typeof value === 'number' || typeof value === 'string';

    return (
      <dl className="border-line grid gap-px border-t sm:grid-cols-2 lg:grid-cols-3">
        {entries.map(([key, value]) => (
          <div key={key} className="border-line border-b py-5 sm:px-5 sm:odd:border-r">
            <dt className="text-muted text-xs">{formatLabel(key)}</dt>
            <dd className="text-ink tabular mt-1.5 font-serif text-2xl leading-none">
              {typeof value === 'number' && key.toLowerCase().includes('revenue')
                ? formatCurrency(value)
                : isMetric(value)
                  ? formatCellValue(value)
                  : formatCellValue(value)}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return <p className="text-sm">{formatCellValue(data)}</p>;
}

export default function AdminReportTypePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = use(params);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [propertyId, setPropertyId] = useState('');

  const propertiesQuery = useQuery(adminQueries.properties());
  const properties = propertiesQuery.data?.data ?? [];

  const queryParams: Record<string, string> = {};
  if (propertyId) queryParams.propertyId = propertyId;
  if (type === 'daily-summary') {
    if (startDate) queryParams.date = startDate;
  } else {
    if (startDate) queryParams.startDate = startDate;
    if (endDate) queryParams.endDate = endDate;
  }

  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    ...adminQueries.report(type, queryParams),
    enabled: !!type && !!propertyId && !!startDate && (type === 'daily-summary' || !!endDate),
  });

  const reportData =
    response && typeof response === 'object' && 'data' in response
      ? (response as { data: unknown }).data
      : response;

  const title = reportTitles[type] ?? formatLabel(type);

  return (
    <Container className="max-w-none px-0 sm:px-0 lg:px-0">
      <PageHeader
        folio="—"
        title={title}
        description="Choose a property and a date range. Reports are calculated live from booking and payment data."
        backHref="/admin/reports"
        backLabel="All reports"
      />

      <section className="border-line mt-8 border-t pt-6" aria-labelledby="report-filters">
        <h2 id="report-filters" className="sr-only">
          Report filters
        </h2>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_auto] lg:items-end">
          <div>
            <Label htmlFor="propertyId">Property</Label>
            <Select
              id="propertyId"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
            >
              <option value="">Select property</option>
              {properties.map((property) => (
                <option key={property.id ?? property._id} value={property.id ?? property._id}>
                  {property.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="startDate">{type === 'daily-summary' ? 'Date' : 'Start date'}</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {type !== 'daily-summary' && (
            <div>
              <Label htmlFor="endDate">End date</Label>
              <Input
                id="endDate"
                type="date"
                min={startDate || undefined}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          )}

          <Button disabled={isFetching} onClick={() => refetch()} className="w-full lg:w-auto">
            {isFetching ? 'Loading…' : 'Apply'}
          </Button>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="report-results">
        <div className="border-line flex items-baseline justify-between border-b pb-3">
          <h2 id="report-results" className="font-serif text-xl leading-snug">
            Results
          </h2>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <Spinner />
          ) : isError ? (
            <Alert variant="error" title="We could not build this report">
              {error instanceof Error ? error.message : 'Please adjust the filters and try again.'}
            </Alert>
          ) : (
            <ReportDataView data={reportData} />
          )}
        </div>
      </section>
    </Container>
  );
}
