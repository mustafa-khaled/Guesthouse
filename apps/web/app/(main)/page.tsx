import { backendFetchApi } from '@/lib/api/server';
import type { Property, PaginatedResponse } from '@/types';
import { SereneHome } from '@/components/sections/serene-home';

export default async function HomePage() {
  let properties: Property[] = [];
  try {
    const res = await backendFetchApi<PaginatedResponse<Property>>('/?limit=12');
    properties = res.data ?? [];
  } catch {
    properties = [];
  }

  return <SereneHome initialProperties={properties} />;
}
