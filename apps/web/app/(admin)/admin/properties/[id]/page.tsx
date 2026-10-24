'use client';

import { use, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { propertyQueries } from '@/queries/properties.queries';
import { clientFetch } from '@/lib/api/client';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import { Textarea } from '@/components/ui/textarea';
import Spinner from '@/components/Spinner';
import { ImageUpload } from '@/components/ui/ImageUpload';
import type { Property } from '@/types';

export default function AdminPropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();

  const { data: property, isLoading, isError, error } = useQuery(propertyQueries.detail(id));

  const [form, setForm] = useState<Partial<Property>>({});

  const current = { ...property, ...form };

  const updateMutation = useMutation({
    mutationFn: (body: Partial<Property>) =>
      clientFetch<{ data: Property }>(`/v1/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      toast.success('Property updated');
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'properties'] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to update property'),
  });

  if (isLoading) return <Spinner />;

  if (isError || !property) {
    return (
      <Container className="max-w-none px-0 sm:px-0 lg:px-0">
        <EmptyState
          title="Property not found"
          description={
            error instanceof Error ? error.message : 'This listing may have been removed.'
          }
          action={<Button href="/admin/properties">Back to properties</Button>}
        />
      </Container>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      name: current.name,
      description: current.description,
      starRating: current.starRating,
      isActive: current.isActive,
      contact: current.contact,
      address: current.address,
      settings: current.settings,
      amenities: current.amenities,
    });
  };

  return (
    <Container className="max-w-none px-0 sm:px-0 lg:px-0">
      <PageHeader
        folio="—"
        title={property.name}
        description="Edit the details guests see, and the settings that shape every booking."
        backHref="/admin/properties"
        backLabel="Properties"
        actions={
          <Button href={`/admin/properties/${id}/inventory`} variant="secondary">
            Manage inventory
          </Button>
        }
      />

      {updateMutation.isError && (
        <Alert variant="error" className="mt-6">
          {updateMutation.error instanceof Error
            ? updateMutation.error.message
            : 'We could not save this property.'}
        </Alert>
      )}

      <section className="border-line mt-10 border-t pt-6" aria-labelledby="details-heading">
        <h2 id="details-heading" className="font-serif text-xl leading-snug">
          Property details
        </h2>

        <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-6">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={current.name ?? ''}
              onChange={(e) => setForm((f: Partial<Property>) => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              value={current.description ?? ''}
              onChange={(e) =>
                setForm((f: Partial<Property>) => ({ ...f, description: e.target.value }))
              }
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={current.address?.city ?? ''}
                onChange={(e) =>
                  setForm((f: Partial<Property>) => ({
                    ...f,
                    address: { ...property.address, ...f.address, city: e.target.value },
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={current.address?.country ?? ''}
                onChange={(e) =>
                  setForm((f: Partial<Property>) => ({
                    ...f,
                    address: {
                      ...property.address,
                      ...f.address,
                      country: e.target.value,
                    },
                  }))
                }
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={current.contact?.phone ?? ''}
                onChange={(e) =>
                  setForm((f: Partial<Property>) => ({
                    ...f,
                    contact: { ...property.contact, ...f.contact, phone: e.target.value },
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={current.contact?.email ?? ''}
                onChange={(e) =>
                  setForm((f: Partial<Property>) => ({
                    ...f,
                    contact: { ...property.contact, ...f.contact, email: e.target.value },
                  }))
                }
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                maxLength={3}
                value={current.settings?.currency ?? 'USD'}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    settings: {
                      ...property.settings,
                      ...f.settings,
                      currency: e.target.value.toUpperCase(),
                    },
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="taxRate">Tax rate %</Label>
              <Input
                id="taxRate"
                type="number"
                value={current.settings?.taxRate ?? 0}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    settings: {
                      ...property.settings,
                      ...f.settings,
                      taxRate: Number(e.target.value),
                    },
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="checkInTime">Check-in time</Label>
              <Input
                id="checkInTime"
                value={current.settings?.checkInTime ?? '15:00'}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    settings: {
                      ...property.settings,
                      ...f.settings,
                      checkInTime: e.target.value,
                    },
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="checkOutTime">Check-out time</Label>
              <Input
                id="checkOutTime"
                value={current.settings?.checkOutTime ?? '11:00'}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    settings: {
                      ...property.settings,
                      ...f.settings,
                      checkOutTime: e.target.value,
                    },
                  }))
                }
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="starRating">Star rating</Label>
              <Input
                id="starRating"
                type="number"
                min={1}
                max={5}
                value={current.starRating ?? ''}
                onChange={(e) =>
                  setForm((f: Partial<Property>) => ({
                    ...f,
                    starRating: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
              />
            </div>
            <div className="flex items-end">
              <label className="focus-ring flex min-h-12 cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  className="accent-brand h-4 w-4"
                  checked={current.isActive !== false}
                  onChange={(e) =>
                    setForm((f: Partial<Property>) => ({ ...f, isActive: e.target.checked }))
                  }
                />
                Active listing
              </label>
            </div>
          </div>

          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </form>
      </section>

      <section className="border-line mt-12 border-t pt-6" aria-labelledby="images-heading">
        <h2 id="images-heading" className="font-serif text-xl leading-snug">
          Property images
        </h2>

        <div className="mt-5 space-y-5">
          <ImageUpload
            type="property-image"
            label="Add property image"
            onUploaded={(result) => {
              const newImages = [
                ...(current.images ?? []),
                {
                  url: result.url,
                  caption: '',
                  isPrimary: (current.images ?? []).length === 0,
                },
              ];
              setForm((f) => ({ ...f, images: newImages }));
              updateMutation.mutate({ images: newImages });
            }}
          />

          {(current.images ?? []).length > 0 && (
            <ul className="grid gap-3 sm:grid-cols-2">
              {(current.images ?? []).map((image, index) => (
                <li
                  key={`${image.url}-${index}`}
                  className="border-line flex items-center justify-between gap-3 rounded-[4px] border px-3 py-2.5 text-sm"
                >
                  <span className="text-muted truncate font-mono text-xs">{image.url}</span>
                  {image.isPrimary && (
                    <span className="text-brand shrink-0 text-[11px] font-medium uppercase tracking-[0.1em]">
                      Primary
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </Container>
  );
}
