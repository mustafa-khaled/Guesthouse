import { z } from 'zod'

const bookingRef = z.object({
  _id: z.string(),
  tour: z.any(),
  user: z.any(),
  price: z.number(),
  createdAt: z.string(),
  paid: z.boolean(),
})

export const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  photo: z.string().default('default.jpg'),
  role: z.enum(['user', 'guide', 'lead-guide', 'admin']).default('user'),
  active: z.boolean().default(true),
})

export const userResponseSchema = userSchema.extend({
  _id: z.string(),
  bookedTours: z.array(bookingRef).optional(),
})

export const signupSchema = z.object({
  name: z.string().min(1, 'Please tell us your name!'),
  email: z.string().email('Please provide a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  passwordConfirm: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Passwords are not the same!',
  path: ['passwordConfirm'],
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Please provide a password'),
})

export const updatePasswordSchema = z.object({
  passwordCurrent: z.string().min(1),
  password: z.string().min(8),
  passwordConfirm: z.string().min(1),
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Passwords are not the same!',
  path: ['passwordConfirm'],
})

export const updateMeSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(8),
  passwordConfirm: z.string().min(1),
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Passwords are not the same!',
  path: ['passwordConfirm'],
})

export type User = z.infer<typeof userSchema>
export type UserResponse = z.infer<typeof userResponseSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>
export type UpdateMeInput = z.infer<typeof updateMeSchema>
