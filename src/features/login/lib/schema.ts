import z from 'zod'

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
export type LoginSchemaType = z.infer<typeof LoginSchema>

export const MfaSchema = z.object({
  mfaCode: z.string().length(6, 'MFA code must be 6 digits'),
})
export type MfaSchemaType = z.infer<typeof MfaSchema>
