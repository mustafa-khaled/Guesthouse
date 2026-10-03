'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminQueries } from '@/features/admin/queries';
import { getId } from '@/lib/utils';
import type { Property } from '@/types';

const STORAGE_KEY = 'staff-property-id';

export function useSelectedProperty() {
  const propertiesQuery = useQuery(adminQueries.properties());
  const properties = (propertiesQuery.data?.data ?? []) as Property[];
  const [propertyId, setPropertyId] = useState('');

  useEffect(() => {
    if (properties.length === 0) return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const match = properties.find((property) => getId(property) === stored);
    setPropertyId(getId(match ?? properties[0]));
  }, [properties]);

  function selectProperty(id: string) {
    setPropertyId(id);
    window.localStorage.setItem(STORAGE_KEY, id);
  }

  return {
    propertyId,
    setPropertyId: selectProperty,
    properties,
    isLoading: propertiesQuery.isLoading,
  };
}
