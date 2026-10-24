'use client';

import { use, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { propertyQueries } from '@/queries/properties.queries';
import { roomTypeQueries, ratePlanQueries } from '@/features/booking/queries';
import { roomQueries } from '@/queries/staff.queries';
import { clientFetch } from '@/lib/api/client';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import { Select } from '@/components/ui/select';
import Spinner from '@/components/Spinner';
import { getId } from '@/lib/utils';
import { cn } from '@/lib/utils';

type Tab = 'room-types' | 'rate-plans' | 'rooms' | 'inventory';

const TABS: { id: Tab; label: string }[] = [
  { id: 'room-types', label: 'Room types' },
  { id: 'rate-plans', label: 'Rate plans' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'inventory', label: 'Inventory' },
];

function Fieldset({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-line border-t pt-6">
      <h2 className="font-serif text-xl leading-snug">{title}</h2>
      {description && <p className="text-muted mt-1.5 text-sm leading-relaxed">{description}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

export default function AdminInventoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: propertyId } = use(params);
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('room-types');
  const [roomTypeName, setRoomTypeName] = useState('');
  const [roomTypeCode, setRoomTypeCode] = useState('');
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState('');
  const [ratePlanName, setRatePlanName] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [invStart, setInvStart] = useState('');
  const [invEnd, setInvEnd] = useState('');
  const [invRooms, setInvRooms] = useState('10');
  const [roomNumber, setRoomNumber] = useState('');
  const [roomFloor, setRoomFloor] = useState('1');
  const [paymentPolicy, setPaymentPolicy] = useState('prepaid');
  const [depositPercentage, setDepositPercentage] = useState('30');
  const [roomTypePrice, setRoomTypePrice] = useState('100');

  const { data: property, isLoading } = useQuery(propertyQueries.detail(propertyId));
  const { data: roomTypes } = useQuery(roomTypeQueries.byProperty(propertyId));
  const { data: ratePlans } = useQuery(ratePlanQueries.byRoomType(selectedRoomTypeId));
  const { data: rooms } = useQuery(roomQueries.byProperty(propertyId));

  const createRoomTypeMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      clientFetch(`/v1/properties/${propertyId}/room-types`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      toast.success('Room type created');
      setRoomTypeName('');
      setRoomTypeCode('');
      queryClient.invalidateQueries({ queryKey: ['room-types', propertyId] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed'),
  });

  const createRatePlanMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      clientFetch(`/v1/room-types/${selectedRoomTypeId}/rate-plans`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      toast.success('Rate plan created');
      setRatePlanName('');
      setBasePrice('');
      queryClient.invalidateQueries({ queryKey: ['rate-plans', selectedRoomTypeId] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed'),
  });

  const createRoomMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      clientFetch(`/v1/properties/${propertyId}/rooms`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      toast.success('Room created');
      setRoomNumber('');
      queryClient.invalidateQueries({ queryKey: ['rooms', propertyId] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed'),
  });

  const updateRatePlanMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      clientFetch(`/v1/rate-plans/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      toast.success('Rate plan updated');
      queryClient.invalidateQueries({ queryKey: ['rate-plans', selectedRoomTypeId] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed'),
  });

  const initInventoryMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      clientFetch('/v1/inventory/initialize', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => toast.success('Inventory initialized'),
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed'),
  });

  if (isLoading) return <Spinner />;

  const roomTypeOptions = roomTypes ?? [];

  return (
    <Container className="max-w-none px-0 sm:px-0 lg:px-0">
      <PageHeader
        folio="—"
        title={`${property?.name ?? 'Property'} — inventory`}
        description="Room types, rate plans, physical rooms, and the daily inventory that makes them bookable."
        backHref={`/admin/properties/${propertyId}`}
        backLabel="Property"
      />

      <nav aria-label="Inventory sections" className="border-line mt-6 border-b">
        <ul className="-mx-1 flex items-center gap-6 overflow-x-auto px-1">
          {TABS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setTab(item.id)}
                aria-current={tab === item.id ? 'page' : undefined}
                className={cn(
                  'focus-ring -mb-px inline-flex min-h-12 items-center border-b-2 text-sm transition-colors duration-200',
                  tab === item.id
                    ? 'border-brand text-ink font-medium'
                    : 'text-muted hover:text-ink border-transparent',
                )}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8">
        {tab === 'room-types' && (
          <div className="grid gap-12 lg:grid-cols-2">
            <Fieldset
              title="Create room type"
              description="A category of room, such as Garden Suite or Horizon Studio."
            >
              <div>
                <Label htmlFor="rtName">Name</Label>
                <Input
                  id="rtName"
                  value={roomTypeName}
                  onChange={(e) => setRoomTypeName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="rtCode">Code</Label>
                <Input
                  id="rtCode"
                  value={roomTypeCode}
                  onChange={(e) => setRoomTypeCode(e.target.value.toUpperCase())}
                  placeholder="GRD"
                />
              </div>
              <div>
                <Label htmlFor="rtPrice">Base price</Label>
                <Input
                  id="rtPrice"
                  type="number"
                  min={0}
                  value={roomTypePrice}
                  onChange={(e) => setRoomTypePrice(e.target.value)}
                />
              </div>
              <Button
                disabled={!roomTypeName || !roomTypeCode || createRoomTypeMutation.isPending}
                onClick={() =>
                  createRoomTypeMutation.mutate({
                    name: roomTypeName,
                    code: roomTypeCode.toUpperCase(),
                    maxOccupancy: { adults: 2, children: 1, total: 3 },
                    basePrice: parseFloat(roomTypePrice) || 100,
                  })
                }
              >
                {createRoomTypeMutation.isPending ? 'Creating…' : 'Create room type'}
              </Button>
            </Fieldset>

            <div className="border-line border-t pt-6">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-serif text-xl leading-snug">Room types</h2>
                <span className="text-muted tabular text-xs">{roomTypeOptions.length}</span>
              </div>
              {roomTypeOptions.length === 0 ? (
                <p className="text-muted mt-4 text-sm">No room types yet.</p>
              ) : (
                <ul className="border-line divide-line mt-4 divide-y border-y">
                  {roomTypeOptions.map((rt) => (
                    <li key={getId(rt)} className="flex items-center justify-between gap-4 py-3">
                      <span className="text-ink text-sm">{rt.name}</span>
                      <span className="text-muted font-mono text-xs">{rt.code}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {tab === 'rate-plans' && (
          <div className="grid gap-12 lg:grid-cols-2">
            <Fieldset
              title="Create rate plan"
              description="How a room is priced and when payment is taken."
            >
              <div>
                <Label htmlFor="rpRoomType">Room type</Label>
                <Select
                  id="rpRoomType"
                  value={selectedRoomTypeId}
                  onChange={(e) => setSelectedRoomTypeId(e.target.value)}
                >
                  <option value="">Select room type</option>
                  {roomTypeOptions.map((rt) => (
                    <option key={getId(rt)} value={getId(rt)}>
                      {rt.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="rpName">Name</Label>
                <Input
                  id="rpName"
                  value={ratePlanName}
                  onChange={(e) => setRatePlanName(e.target.value)}
                  placeholder="Flexible rate"
                />
              </div>
              <div>
                <Label htmlFor="rpPrice">Base price</Label>
                <Input
                  id="rpPrice"
                  type="number"
                  min={0}
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="paymentPolicy">Payment policy</Label>
                <Select
                  id="paymentPolicy"
                  value={paymentPolicy}
                  onChange={(e) => setPaymentPolicy(e.target.value)}
                >
                  <option value="prepaid">Prepaid</option>
                  <option value="deposit">Deposit</option>
                  <option value="pay-at-hotel">Pay at hotel</option>
                </Select>
              </div>
              {paymentPolicy === 'deposit' && (
                <div>
                  <Label htmlFor="depositPercentage">Deposit %</Label>
                  <Input
                    id="depositPercentage"
                    type="number"
                    value={depositPercentage}
                    onChange={(e) => setDepositPercentage(e.target.value)}
                  />
                </div>
              )}
              <Button
                disabled={
                  !selectedRoomTypeId ||
                  !ratePlanName ||
                  !basePrice ||
                  createRatePlanMutation.isPending
                }
                onClick={() =>
                  createRatePlanMutation.mutate({
                    name: ratePlanName,
                    code: ratePlanName.toLowerCase().replace(/\s+/g, '-'),
                    basePrice: parseFloat(basePrice),
                    currency: 'USD',
                    paymentPolicy,
                    depositPercentage:
                      paymentPolicy === 'deposit' ? Number(depositPercentage) : undefined,
                    cancellationPolicy: {
                      type: 'flexible',
                      deadlineHours: 24,
                      penaltyPercentage: 0,
                    },
                  })
                }
              >
                {createRatePlanMutation.isPending ? 'Creating…' : 'Create rate plan'}
              </Button>
            </Fieldset>

            <div className="border-line border-t pt-6">
              <h2 className="font-serif text-xl leading-snug">Rate plans</h2>
              {!selectedRoomTypeId ? (
                <p className="text-muted mt-4 text-sm">
                  Select a room type to view its rate plans.
                </p>
              ) : (ratePlans ?? []).length === 0 ? (
                <p className="text-muted mt-4 text-sm">No rate plans for this room type yet.</p>
              ) : (
                <ul className="border-line divide-line mt-4 divide-y border-y">
                  {(ratePlans ?? []).map((rp) => (
                    <li
                      key={getId(rp)}
                      className="flex flex-wrap items-center justify-between gap-3 py-3"
                    >
                      <div>
                        <p className="text-ink text-sm">{rp.name}</p>
                        <p className="text-muted mt-0.5 text-xs capitalize">
                          {rp.paymentPolicy ?? 'prepaid'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="tabular text-sm">${rp.basePrice}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={updateRatePlanMutation.isPending}
                          onClick={() =>
                            updateRatePlanMutation.mutate({
                              id: getId(rp),
                              body: {
                                paymentPolicy,
                                depositPercentage:
                                  paymentPolicy === 'deposit'
                                    ? Number(depositPercentage)
                                    : undefined,
                              },
                            })
                          }
                        >
                          Update policy
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {tab === 'rooms' && (
          <div className="grid gap-12 lg:grid-cols-2">
            <Fieldset title="Create room" description="A physical, numbered room.">
              <div>
                <Label htmlFor="roomType">Room type</Label>
                <Select
                  id="roomType"
                  value={selectedRoomTypeId}
                  onChange={(e) => setSelectedRoomTypeId(e.target.value)}
                >
                  <option value="">Select room type</option>
                  {roomTypeOptions.map((rt) => (
                    <option key={getId(rt)} value={getId(rt)}>
                      {rt.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="roomNumber">Room number</Label>
                <Input
                  id="roomNumber"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="101"
                />
              </div>
              <div>
                <Label htmlFor="roomFloor">Floor</Label>
                <Input
                  id="roomFloor"
                  type="number"
                  value={roomFloor}
                  onChange={(e) => setRoomFloor(e.target.value)}
                />
              </div>
              <Button
                disabled={!selectedRoomTypeId || !roomNumber || createRoomMutation.isPending}
                onClick={() =>
                  createRoomMutation.mutate({
                    roomTypeId: selectedRoomTypeId,
                    roomNumber,
                    floor: Number(roomFloor),
                  })
                }
              >
                {createRoomMutation.isPending ? 'Creating…' : 'Create room'}
              </Button>
            </Fieldset>

            <div className="border-line border-t pt-6">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-serif text-xl leading-snug">Rooms</h2>
                <span className="text-muted tabular text-xs">{(rooms ?? []).length}</span>
              </div>
              {(rooms ?? []).length === 0 ? (
                <p className="text-muted mt-4 text-sm">No rooms yet.</p>
              ) : (
                <ul className="border-line divide-line mt-4 grid grid-cols-2 divide-y border-y sm:grid-cols-3">
                  {(rooms ?? []).map((room) => {
                    const record = room as Record<string, unknown>;
                    return (
                      <li
                        key={getId(room as { id?: string; _id?: string })}
                        className="tabular border-line py-3 text-sm"
                      >
                        {String(record.roomNumber ?? record.number ?? '')}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}

        {tab === 'inventory' && (
          <div className="max-w-lg">
            <Fieldset
              title="Initialize inventory"
              description="Open up a date range for a room type, with the number of rooms available each night."
            >
              <div>
                <Label htmlFor="invRoomType">Room type</Label>
                <Select
                  id="invRoomType"
                  value={selectedRoomTypeId}
                  onChange={(e) => setSelectedRoomTypeId(e.target.value)}
                >
                  <option value="">Select room type</option>
                  {roomTypeOptions.map((rt) => (
                    <option key={getId(rt)} value={getId(rt)}>
                      {rt.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="invStart">Start date</Label>
                  <Input
                    id="invStart"
                    type="date"
                    value={invStart}
                    onChange={(e) => setInvStart(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="invEnd">End date</Label>
                  <Input
                    id="invEnd"
                    type="date"
                    min={invStart || undefined}
                    value={invEnd}
                    onChange={(e) => setInvEnd(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="invRooms">Available rooms per day</Label>
                <Input
                  id="invRooms"
                  type="number"
                  min={1}
                  value={invRooms}
                  onChange={(e) => setInvRooms(e.target.value)}
                />
              </div>
              <Button
                disabled={
                  !selectedRoomTypeId || !invStart || !invEnd || initInventoryMutation.isPending
                }
                onClick={() =>
                  initInventoryMutation.mutate({
                    propertyId,
                    roomTypeId: selectedRoomTypeId,
                    startDate: invStart,
                    endDate: invEnd,
                    totalRooms: parseInt(invRooms, 10),
                  })
                }
              >
                {initInventoryMutation.isPending ? 'Initializing…' : 'Initialize inventory'}
              </Button>

              {initInventoryMutation.isError && (
                <Alert variant="error">
                  {initInventoryMutation.error instanceof Error
                    ? initInventoryMutation.error.message
                    : 'Could not initialize inventory.'}
                </Alert>
              )}
            </Fieldset>
          </div>
        )}
      </div>
    </Container>
  );
}
