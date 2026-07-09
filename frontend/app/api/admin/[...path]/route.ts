import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ACCESS_TOKEN_COOKIE, BACKEND_URL } from '@/lib/constants';
import { buildProxyRequest } from '@/lib/api/proxy';

async function proxyAdmin(request: NextRequest, path: string[]) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const url = new URL(request.url);
  const target = `${BACKEND_URL}/admin/${path.join('/')}${url.search}`;
  const { headers, body } = await buildProxyRequest(request, accessToken);

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: 'no-store',
  };

  if (body !== undefined) init.body = body;

  const res = await fetch(target, init);
  const data = await res.text();

  return new NextResponse(data, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyAdmin(request, (await params).path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyAdmin(request, (await params).path);
}
