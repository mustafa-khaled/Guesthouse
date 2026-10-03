'use client';

import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import { uploadImage, type UploadType } from '@/lib/api/upload';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  type: UploadType;
  label?: string;
  onUploaded: (result: { url: string; publicId: string }) => void;
  disabled?: boolean;
}

export function ImageUpload({
  type,
  label = 'Upload image',
  onUploaded,
  disabled = false,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setPreview(URL.createObjectURL(file));
      setUploading(true);

      try {
        const result = await uploadImage(type, file);
        onUploaded({ url: result.url, publicId: result.publicId });
      } catch (err) {
        setPreview(null);
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setUploading(false);
      }
    },
    [type, onUploaded],
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled || uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith('image/')) void handleFile(file);
  };

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-center transition hover:border-green-600 hover:bg-green-50"
      >
        {preview ? (
          <div className="relative h-24 w-full max-w-xs">
            <Image src={preview} alt="Preview" fill className="rounded object-cover" unoptimized />
          </div>
        ) : (
          <p className="text-sm text-gray-600">Drag and drop an image, or click to browse</p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={onInputChange}
          disabled={disabled || uploading}
        />
      </div>

      <Button
        type="button"
        variant="outline"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? 'Uploading...' : label}
      </Button>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
