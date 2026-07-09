import { z } from 'zod';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(5000),

    MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
    REDIS_URL: z.string().url().optional(),

    JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
    JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),

    FRONTEND_URL: z.string().url().default('http://localhost:3001'),
    CORS_ORIGINS: z.string().optional(),
    APP_URL: z.string().url().default('http://localhost:5000'),

    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    SMTP_EMAIL_FROM: z.string().optional(),

    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),

    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GOOGLE_CALLBACK_URL: z.string().optional(),

    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),

    AUDIT_LOG_RETENTION_DAYS: z.coerce.number().default(90),

    SENTRY_DSN: z.string().url().optional(),

    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV !== 'production') return;

    const required: Array<{ key: keyof typeof data; label: string }> = [
      { key: 'REDIS_URL', label: 'REDIS_URL' },
      { key: 'STRIPE_SECRET_KEY', label: 'STRIPE_SECRET_KEY' },
      { key: 'STRIPE_WEBHOOK_SECRET', label: 'STRIPE_WEBHOOK_SECRET' },
      { key: 'SMTP_HOST', label: 'SMTP_HOST' },
      { key: 'SMTP_USER', label: 'SMTP_USER' },
      { key: 'SMTP_PASSWORD', label: 'SMTP_PASSWORD' },
      { key: 'SMTP_EMAIL_FROM', label: 'SMTP_EMAIL_FROM' },
      { key: 'CLOUDINARY_CLOUD_NAME', label: 'CLOUDINARY_CLOUD_NAME' },
      { key: 'CLOUDINARY_API_KEY', label: 'CLOUDINARY_API_KEY' },
      { key: 'CLOUDINARY_API_SECRET', label: 'CLOUDINARY_API_SECRET' },
    ];

    for (const { key, label } of required) {
      if (!data[key]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${label} is required when NODE_ENV=production`,
          path: [key],
        });
      }
    }
  });

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
