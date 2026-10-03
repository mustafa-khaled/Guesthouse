import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ACCESS_TOKEN_COOKIE, BACKEND_URL } from '@/lib/constants';
import { buildProxyRequest } from '@/lib/api/proxy';

const UPLOAD_TYPES = new Set(['property-image', 'room-type-image', 'guest-image']);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> },
) {
  const { type } = await params;

  if (!UPLOAD_TYPES.has(type)) {
    return NextResponse.json({ message: 'Invalid upload type' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const { headers, body } = await buildProxyRequest(request, accessToken);
  const target = `${BACKEND_URL}/api/v1/upload/${type}`;

  const res = await fetch(target, {
    method: 'POST',
    headers,
    body,
    cache: 'no-store',
  });

  const data = await res.text();
  return new NextResponse(data, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' },
  });
}
