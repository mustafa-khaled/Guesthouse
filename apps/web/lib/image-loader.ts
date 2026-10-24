/**
 * Global `next/image` loader.
 *
 * The site serves photography from Unsplash (curated editorial imagery) and,
 * in production, Cloudinary (guest and staff uploads). A single custom loader
 * keeps both providers width-aware without passing a function prop from a
 * Server Component into `next/image`.
 */
export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  if (!/^https?:\/\//.test(src)) return src;

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return src;
  }

  if (url.hostname === 'images.unsplash.com') {
    url.searchParams.set('auto', 'format');
    url.searchParams.set('fit', 'crop');
    url.searchParams.set('w', String(width));
    url.searchParams.set('q', String(quality ?? 72));
    return url.toString();
  }

  if (url.hostname === 'res.cloudinary.com') {
    const params = ['f_auto', 'c_limit', `w_${width}`, `q_${quality || 'auto'}`];
    const marker = '/upload/';
    const index = src.indexOf(marker);
    if (index === -1) return src;
    return `${src.slice(0, index + marker.length)}${params.join(',')}/${src.slice(
      index + marker.length,
    )}`;
  }

  return src;
}
