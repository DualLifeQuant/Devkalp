import { z } from 'zod'

// ── Auth ──────────────────────────────────────────────────────────────────────

export const LoginFormSchema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
export type LoginFormData = z.infer<typeof LoginFormSchema>

export const RegisterFormSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email:     z.string().email('Enter a valid email'),
  phone:     z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number').optional().or(z.literal('')),
  password:  z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['matrimony', 'donor', 'candidate', 'volunteer'], {
    required_error: 'Please select a role',
  }),
})
export type RegisterFormData = z.infer<typeof RegisterFormSchema>

// ── Donation ──────────────────────────────────────────────────────────────────

export const DonationSchema = z.object({
  amount:       z.number().min(1, 'Minimum donation ₹1').max(10_00_000, 'Maximum ₹10,00,000'),
  campaign_id:  z.string().optional(),
  donor_name:   z.string().min(2, 'Name is required'),
  donor_email:  z.string().email('Enter a valid email').optional().or(z.literal('')),
  donor_phone:  z.string().optional(),
  is_anonymous: z.boolean().default(false),
})
export type DonationFormData = z.infer<typeof DonationSchema>

// ── Job ───────────────────────────────────────────────────────────────────────

export const JobApplicationSchema = z.object({
  cover_letter: z.string().min(50, 'Cover letter must be at least 50 characters').max(2000),
  years_exp:    z.number().min(0).max(50).optional(),
  portfolio:    z.string().url('Enter a valid URL').optional().or(z.literal('')),
})
export type JobApplicationData = z.infer<typeof JobApplicationSchema>

// ── Matrimony profile ─────────────────────────────────────────────────────────

export const MatrimonyProfileSchema = z.object({
  date_of_birth:  z.string().min(1, 'Date of birth is required'),
  gender:         z.enum(['male', 'female']),
  religion:       z.string().min(1, 'Religion is required'),
  caste:          z.string().optional(),
  height_cm:      z.number().min(120).max(250).optional(),
  education:      z.string().min(1, 'Education is required'),
  occupation:     z.string().min(1, 'Occupation is required'),
  city:           z.string().min(1, 'City is required'),
  state:          z.string().min(1, 'State is required'),
  about:          z.string().max(1000).optional(),
})
export type MatrimonyProfileData = z.infer<typeof MatrimonyProfileSchema>
