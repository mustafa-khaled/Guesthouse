import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ACCESS_TOKEN_COOKIE, BACKEND_URL } from '@/lib/constants';
import { buildProxyRequest } from '@/lib/api/proxy';

/**
 * Proxy for the API collection root (`/api/v1`).
 *
 * Property listing lives at the router root rather than a named segment, so the
 * `[...path]` catch-all cannot reach it — a catch-all needs at least one segment.
 */
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const url = new URL(request.url);
  const target = `${BACKEND_URL}/api/v1/${url.search}`;

  const { headers } = await buildProxyRequest(request, accessToken);
  const incomingRequestId = request.headers.get('x-request-id');
  if (incomingRequestId) headers['X-Request-Id'] = incomingRequestId;

  const res = await fetch(target, { method: 'GET', headers, cache: 'no-store' });
  const data = await res.text();

  return new NextResponse(data, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' },
  });
}
