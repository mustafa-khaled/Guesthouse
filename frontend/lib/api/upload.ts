export type UploadType = 'property-image' | 'room-type-image' | 'guest-image';

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

interface UploadResponse {
  message: string;
  data: UploadResult;
}

export async function uploadImage(type: UploadType, file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`/api/upload/${type}`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error.message || 'Upload failed');
  }

  const json = (await res.json()) as UploadResponse;
  return json.data;
}

export async function deleteUploadedImage(publicId: string): Promise<void> {
  const encoded = encodeURIComponent(publicId);
  const res = await fetch(`/api/v1/upload/images/${encoded}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Delete failed' }));
    throw new Error(error.message || 'Delete failed');
  }
}
