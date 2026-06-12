import { z } from 'zod'

// ---------------------------------------------------------------------------
// Zod v4 compatible schemas
// In Zod v4, enum custom errors use { error: 'message' } not errorMap.
// z.coerce.number() on empty string "" returns 0 (coerces via Number("") → 0)
// ---------------------------------------------------------------------------

export const salonSchema = z.object({
  business_name: z.string().min(1, 'Business name is required'),

  // Zod v4 enum: custom error via second arg string or { error: '...' }
  payment_type: z.enum(['Monthly', 'Quarterly', 'Yearly', 'One-time'], {
    error: 'Select a payment type',
  }),

  // coerce handles string→number from HTML inputs; NaN→fail
  amount: z.coerce
    .number({ error: 'Amount must be a number' })
    .min(0, 'Amount must be 0 or more'),

  transaction_id: z.string().min(1, 'Transaction ID is required'),

  active: z.boolean().default(true),

  referral_code: z.string().optional().default(''),
})

export const branchSchema = z.object({
  name: z.string().min(1, 'Branch name is required'),
  address_line_1: z.string().min(1, 'Address line 1 is required'),
  address_line_2: z.string().optional().default(''),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z
    .string()
    .min(1, 'Pincode is required')
    .regex(/^\d{6}$/, 'Pincode must be exactly 6 digits'),
  country: z.string().min(1, 'Country is required').default('India'),
  active: z.boolean().default(true),
})

export const ownerSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  phone: z
    .string()
    .min(1, 'Phone is required')
    .regex(/^\d{10}$/, 'Phone must be exactly 10 digits'),
  // password is optional — empty string is acceptable (backend auto-generates)
  password: z.string().optional().default(''),
  active: z.boolean().default(true),
})

export const serviceProductSchema = z.object({
  service: z.string().min(1, 'Service name is required'),
  product: z.string().min(1, 'Product is required'),
  price: z.coerce
    .number({ error: 'Price must be a number' })
    .min(0, 'Price must be 0 or more'),
  duration: z.coerce
    .number({ error: 'Duration must be a number' })
    .min(1, 'Duration must be at least 1 minute'),
  active: z.boolean().default(true),
})

export const onboardingSchema = z.object({
  salon: salonSchema,
  branch: branchSchema,
  owner: ownerSchema,
  service_products: z.array(serviceProductSchema).optional().default([]),
})
