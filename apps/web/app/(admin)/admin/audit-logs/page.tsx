'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ScrollText } from 'lucide-react';
import { adminQueries } from '@/queries/admin.queries';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
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
import type { AuditLog } from '@/types';

export default function AdminAuditLogsPage() {
  const [page, setPage] = useState(1);
  const limit = 30;

  const { data, isLoading, isError, error, isFetching } = useQuery(
    adminQueries.auditLogs({ page: String(page), limit: String(limit) }),
  );

  if (isLoading) return <Spinner />;

  const logs = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <Container className="max-w-none px-0 sm:px-0 lg:px-0">
      <PageHeader
        folio="—"
        title="Audit logs"
        description="A durable record of who changed what, and when. Useful when something needs explaining."
      />

      {isError && (
        <Alert variant="error" className="mt-8" title="We could not load the audit log">
          {error instanceof Error ? error.message : 'Please refresh the page and try again.'}
        </Alert>
      )}

      <div className="mt-8">
        {logs.length === 0 ? (
          <EmptyState
            icon={<ScrollText />}
            title="Nothing logged yet"
            description="Administrative actions will be recorded here as they happen."
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Resource ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log: AuditLog) => (
                  <TableRow key={getId(log)}>
                    <TableCell className="text-muted tabular whitespace-nowrap text-xs">
                      {log.createdAt ? formatDate(log.createdAt) : '—'}
                    </TableCell>
                    <TableCell className="text-ink font-medium">{log.action}</TableCell>
                    <TableCell>{log.resource}</TableCell>
                    <TableCell className="text-muted font-mono text-xs">
                      {log.resourceId?.slice(0, 12) ?? '—'}
                    </TableCell>
                    <TableCell className="text-muted">{getRefLabel(log.userId as never)}</TableCell>
                    <TableCell className="text-muted font-mono text-xs">
                      {log.ipAddress || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-muted tabular text-xs">
                  Page {pagination.page} of {pagination.totalPages} · {pagination.total} entries
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!pagination.hasPrevPage || isFetching}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!pagination.hasNextPage || isFetching}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Container>
  );
}
