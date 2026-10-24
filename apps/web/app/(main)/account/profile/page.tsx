'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { UserRound } from 'lucide-react';
import { ApiError, clientFetch } from '@/lib/api/client';
import { useAuth } from '@/hooks/useAuth';
import type { Guest } from '@/types';
import { AccountNav } from '@/components/shared/account-nav';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import { Skeleton } from '@/components/ui/skeleton';

const guestProfileQuery = {
  queryKey: ['guest-profile'] as const,
  queryFn: () => clientFetch<{ data: Guest }>('/v1/user/me/guest-profile'),
};

export default function GuestProfilePage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data, isLoading, isError, error } = useQuery({
    ...guestProfileQuery,
    // A 404 means this guest has no saved profile yet — that is a state to fill
    // in, not a failure worth retrying.
    retry: false,
  });
  const missingProfile = isError && error instanceof ApiError && error.status === 404;

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationality: '',
  });

  useEffect(() => {
    if (data?.data) {
      const guest = data.data;
      setForm({
        firstName: guest.firstName ?? '',
        lastName: guest.lastName ?? '',
        email: guest.email ?? '',
        phone: guest.phone ?? '',
        nationality: guest.nationality ?? '',
      });
      return;
    }

    if (missingProfile && user) {
      const [firstName, ...rest] = (user.name ?? '').split(' ');
      setForm((current) => ({
        ...current,
        firstName: current.firstName || firstName || '',
        lastName: current.lastName || rest.join(' '),
        email: current.email || user.email || '',
      }));
    }
  }, [data, missingProfile, user]);

  const updateMutation = useMutation({
    mutationFn: (body: typeof form) =>
      clientFetch<{ data: Guest }>('/v1/user/me/guest-profile', {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      toast.success('Profile updated');
      queryClient.invalidateQueries({ queryKey: guestProfileQuery.queryKey });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    },
  });

  return (
    <Container className="py-12 md:py-16">
      <PageHeader
        folio="—"
        title="Guest profile"
        description="The details we keep so that arrival feels familiar, whichever house you stay in."
        backHref="/account"
        backLabel="Account"
      />

      <div className="mt-6">
        <AccountNav />
      </div>

      <div className="mt-10 max-w-2xl">
        {isLoading && (
          <div className="space-y-5">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-3/4" />
          </div>
        )}

        {isError && !missingProfile && (
          <EmptyState
            icon={<UserRound />}
            title="We could not load your profile"
            description="Please refresh the page. If it keeps happening, the concierge can update it for you."
            action={
              <Button href="/account" variant="secondary">
                Back to account
              </Button>
            }
          />
        )}

        {!isLoading && (!isError || missingProfile) && (
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              updateMutation.mutate(form);
            }}
          >
            {missingProfile && (
              <p className="text-muted text-sm leading-relaxed">
                We do not have your details on file yet. Add them once and every future stay will
                start from here.
              </p>
            )}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  autoComplete="given-name"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  autoComplete="family-name"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  value={form.nationality}
                  onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                />
              </div>
            </div>

            {updateMutation.isError && (
              <Alert variant="error">
                {updateMutation.error instanceof Error
                  ? updateMutation.error.message
                  : 'We could not save your profile.'}
              </Alert>
            )}

            <div className="flex items-center gap-4">
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving…' : 'Save profile'}
              </Button>
              {updateMutation.isSuccess && (
                <p role="status" className="text-success text-sm">
                  Saved.
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </Container>
  );
}
