import Image, { type ImageProps } from 'next/image';

type PhotoProps = Omit<ImageProps, 'src' | 'alt' | 'loader'> & {
  src: string;
  alt: string;
};

/**
 * Remote photography (Unsplash / Cloudinary).
 *
 * Sizing and format negotiation live in the global custom loader
 * (`lib/image-loader.ts`), so this stays a Server Component and never has to
 * pass a function across the client boundary.
 */
export function Photo({ src, alt, quality = 72, ...props }: PhotoProps) {
  return <Image src={src} alt={alt} quality={quality} {...props} />;
}
