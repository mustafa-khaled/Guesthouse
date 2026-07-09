import path from 'path';
import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '..'),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    ...(cloudinaryCloudName
      ? {
          loader: 'custom',
          loaderFile: './lib/cloudinary-loader.ts',
        }
      : {}),
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
  ],
};

export default withSentryConfig(nextConfig, {
  silent: true,
  disableLogger: true,
});
