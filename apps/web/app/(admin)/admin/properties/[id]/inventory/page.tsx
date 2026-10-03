'use client';

import Link from 'next/link';
import { use, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { propertyQueries } from '@/queries/properties.queries';
import { roomTypeQueries, ratePlanQueries } from '@/features/booking/queries';
import { roomQueries } from '@/queries/staff.queries';
import { clientFetch } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Spinner from '@/components/Spinner';
import { getId } from '@/lib/utils';

type Tab = 'room-types' | 'rate-plans' | 'rooms' | 'inventory';

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

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/properties/${propertyId}`}
          className="text-sm text-green-700 hover:underline"
        >
          &larr; Back to property
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{property?.name} — Inventory</h1>
      </div>

      <div className="flex gap-2 border-b">
        {(['room-types', 'rate-plans', 'rooms', 'inventory'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize ${
              tab === t ? 'border-b-2 border-green-600 text-green-700' : 'text-gray-500'
            }`}
          >
            {t.replace('-', ' ')}
          </button>
        ))}
      </div>

      {tab === 'room-types' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Create room type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
                  onChange={(e) => setRoomTypeCode(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="rtPrice">Base price</Label>
                <Input
                  id="rtPrice"
                  type="number"
                  value={roomTypePrice}
                  onChange={(e) => setRoomTypePrice(e.target.value)}
                />
              </div>
              <Button
                disabled={!roomTypeName || !roomTypeCode}
                onClick={() =>
                  createRoomTypeMutation.mutate({
                    name: roomTypeName,
                    code: roomTypeCode.toUpperCase(),
                    maxOccupancy: { adults: 2, children: 1, total: 3 },
                    basePrice: parseFloat(roomTypePrice) || 100,
                  })
                }
              >
                Create room type
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Room types</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {(roomTypes ?? []).map((rt) => (
                  <li key={getId(rt)} className="flex justify-between rounded border p-3">
                    <span>{rt.name}</span>
                    <span className="text-gray-500">{rt.code}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === 'rate-plans' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Create rate plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Room type</Label>
                <select
                  className="mt-1 flex h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
                  value={selectedRoomTypeId}
                  onChange={(e) => setSelectedRoomTypeId(e.target.value)}
                >
                  <option value="">Select room type</option>
                  {(roomTypes ?? []).map((rt) => (
                    <option key={getId(rt)} value={getId(rt)}>
                      {rt.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="rpName">Name</Label>
                <Input
                  id="rpName"
                  value={ratePlanName}
                  onChange={(e) => setRatePlanName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="rpPrice">Base price</Label>
                <Input
                  id="rpPrice"
                  type="number"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="paymentPolicy">Payment policy</Label>
                <select
                  id="paymentPolicy"
                  className="mt-1 flex h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
                  value={paymentPolicy}
                  onChange={(e) => setPaymentPolicy(e.target.value)}
                >
                  <option value="prepaid">Prepaid</option>
                  <option value="deposit">Deposit</option>
                  <option value="pay-at-hotel">Pay at hotel</option>
                </select>
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
                disabled={!selectedRoomTypeId || !ratePlanName || !basePrice}
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
                Create rate plan
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Rate plans</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedRoomTypeId ? (
                <ul className="space-y-2 text-sm">
                  {(ratePlans ?? []).map((rp) => (
                    <li
                      key={getId(rp)}
                      className="flex items-center justify-between rounded border p-3"
                    >
                      <span>
                        {rp.name} · {rp.paymentPolicy ?? 'prepaid'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span>${rp.basePrice}</span>
                        <Button
                          size="sm"
                          variant="outline"
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
              ) : (
                <p className="text-sm text-gray-500">Select a room type to view rate plans</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {tab === 'rooms' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Create room</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Room type</Label>
                <select
                  className="mt-1 flex h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
                  value={selectedRoomTypeId}
                  onChange={(e) => setSelectedRoomTypeId(e.target.value)}
                >
                  <option value="">Select room type</option>
                  {(roomTypes ?? []).map((rt) => (
                    <option key={getId(rt)} value={getId(rt)}>
                      {rt.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="roomNumber">Room number</Label>
                <Input
                  id="roomNumber"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
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
                disabled={!selectedRoomTypeId || !roomNumber}
                onClick={() =>
                  createRoomMutation.mutate({
                    roomTypeId: selectedRoomTypeId,
                    roomNumber,
                    floor: Number(roomFloor),
                  })
                }
              >
                Create room
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Rooms</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {(rooms ?? []).map((room) => {
                  const record = room as Record<string, unknown>;
                  return (
                    <li
                      key={getId(room as { id?: string; _id?: string })}
                      className="rounded border p-3"
                    >
                      Room {String(record.roomNumber ?? record.number ?? '')}
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === 'inventory' && (
        <Card>
          <CardHeader>
            <CardTitle>Initialize inventory</CardTitle>
          </CardHeader>
          <CardContent className="max-w-md space-y-3">
            <div>
              <Label>Room type</Label>
              <select
                className="mt-1 flex h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
                value={selectedRoomTypeId}
                onChange={(e) => setSelectedRoomTypeId(e.target.value)}
              >
                <option value="">Select room type</option>
                {(roomTypes ?? []).map((rt) => (
                  <option key={getId(rt)} value={getId(rt)}>
                    {rt.name}
                  </option>
                ))}
              </select>
            </div>
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
                value={invEnd}
                onChange={(e) => setInvEnd(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="invRooms">Available rooms per day</Label>
              <Input
                id="invRooms"
                type="number"
                value={invRooms}
                onChange={(e) => setInvRooms(e.target.value)}
              />
            </div>
            <Button
              disabled={!selectedRoomTypeId || !invStart || !invEnd}
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
              Initialize inventory
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
