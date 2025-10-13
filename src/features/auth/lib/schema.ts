import z from 'zod'

// LOGIN
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
export type LoginSchemaType = z.infer<typeof LoginSchema>

// REGISTER
export const RegisterSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export const ConfirmRegistrationSchema = z.object({
  code: z.string().length(6, 'Verification code must be 6 digits'),
})

export type RegisterSchemaType = z.infer<typeof RegisterSchema>
export type ConfirmRegistrationSchemaType = z.infer<typeof ConfirmRegistrationSchema>
