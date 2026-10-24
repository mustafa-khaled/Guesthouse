'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Building2 } from 'lucide-react';
import { adminQueries } from '@/queries/admin.queries';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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
import { getId } from '@/lib/utils';
import type { Property } from '@/types';

export default function AdminPropertiesPage() {
  const { data, isLoading, isError, error } = useQuery(adminQueries.properties());

  if (isLoading) return <Spinner />;

  const properties = data?.data ?? [];

  return (
    <Container className="max-w-none px-0 sm:px-0 lg:px-0">
      <PageHeader
        folio="—"
        title="Properties"
        description="Every house in the collection — listings, inventory, and how each one is presented."
        actions={<Button href="/admin/properties/new">New property</Button>}
      />

      {isError && (
        <Alert variant="error" className="mt-8" title="We could not load properties">
          {error instanceof Error ? error.message : 'Please refresh the page and try again.'}
        </Alert>
      )}

      <div className="mt-8">
        {properties.length === 0 ? (
          <EmptyState
            icon={<Building2 />}
            title="No properties yet"
            description="Create the first property to start taking bookings."
            action={<Button href="/admin/properties/new">Create property</Button>}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property: Property) => (
                <TableRow key={getId(property)}>
                  <TableCell className="text-ink font-medium">{property.name}</TableCell>
                  <TableCell className="text-muted">
                    {[property.address?.city, property.address?.country]
                      .filter(Boolean)
                      .join(', ') || '—'}
                  </TableCell>
                  <TableCell className="tabular">
                    {property.starRating ? `${property.starRating} ★` : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={property.isActive !== false ? 'success' : 'danger'} dot>
                      {property.isActive !== false ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/admin/properties/${getId(property)}`}
                      className="focus-ring text-brand text-sm underline-offset-4 hover:underline"
                    >
                      Edit
                    </Link>
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
