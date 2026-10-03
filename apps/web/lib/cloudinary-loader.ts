export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;

  if (!cloudName || !src.includes('res.cloudinary.com')) {
    return src;
  }

  const params = ['f_auto', 'c_limit', `w_${width}`, `q_${quality || 'auto'}`];
  const marker = `/upload/`;
  const index = src.indexOf(marker);

  if (index === -1) return src;

  const prefix = src.slice(0, index + marker.length);
  const suffix = src.slice(index + marker.length);
  return `${prefix}${params.join(',')}/${suffix}`;
}
