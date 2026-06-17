import { z } from 'zod'
import { RoleEnum } from './enums.js'

export const userSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email(),
  role: RoleEnum.default('user'),
  isEmailVerified: z.boolean().default(false),
  authProvider: z.enum(['local', 'google']).default('local'),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export const signupSchema = z
  .object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    email: z.string().email('Please provide a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    passwordConfirm: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords are not the same!',
    path: ['passwordConfirm'],
  })

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Please provide a password'),
})

export const updatePasswordSchema = z
  .object({
    passwordCurrent: z.string().min(1),
    password: z.string().min(6),
    passwordConfirm: z.string().min(1),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords are not the same!',
    path: ['passwordConfirm'],
  })

export const updateMeSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(6),
    passwordConfirm: z.string().min(1),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords are not the same!',
    path: ['passwordConfirm'],
  })

export type User = z.infer<typeof userSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>
export type UpdateMeInput = z.infer<typeof updateMeSchema>
