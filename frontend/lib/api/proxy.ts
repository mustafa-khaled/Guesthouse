import { NextRequest } from 'next/server';

export async function buildProxyRequest(
  request: NextRequest,
  accessToken?: string,
): Promise<{ headers: Record<string, string>; body?: BodyInit }> {
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  if (request.method === 'GET' || request.method === 'HEAD') {
    return { headers };
  }

  const contentType = request.headers.get('content-type');

  if (contentType?.includes('multipart/form-data')) {
    const formData = await request.formData();
    return { headers, body: formData };
  }

  if (contentType) headers['Content-Type'] = contentType;
  return { headers, body: await request.text() };
}
