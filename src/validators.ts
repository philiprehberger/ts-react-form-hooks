import { z } from 'zod';

/**
 * Reusable Zod field validators for common input types.
 */
export const validators = {
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address').max(255, 'Email must be less than 255 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password must be less than 128 characters').regex(/[A-Z]/, 'Must contain an uppercase letter').regex(/[a-z]/, 'Must contain a lowercase letter').regex(/[0-9]/, 'Must contain a number'),
  passwordSimple: z.string().min(1, 'Password is required').min(8, 'Password must be at least 8 characters'),
  phone: z.string().regex(/^[\d\s\-+()]*$/, 'Please enter a valid phone number').optional().or(z.literal('')),
  phoneRequired: z.string().min(1, 'Phone number is required').regex(/^[\d\s\-+()]{7,20}$/, 'Please enter a valid phone number'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters').regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters'),
  nameOptional: z.string().max(100, 'Name must be less than 100 characters').regex(/^[a-zA-Z\s'-]*$/, 'Name contains invalid characters').optional().or(z.literal('')),
  price: z.number().min(0, 'Price cannot be negative').max(999999.99, 'Price exceeds maximum'),
  quantity: z.number().int('Quantity must be a whole number').min(0, 'Quantity cannot be negative').max(9999, 'Quantity exceeds maximum'),
  url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  urlRequired: z.string().min(1, 'URL is required').url('Please enter a valid URL'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only'),
  rating: z.number().int('Rating must be a whole number').min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Please enter a valid date'),
  futureDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Please enter a valid date').refine((val) => new Date(val) > new Date(), 'Date must be in the future'),
  checkbox: z.boolean(),
  checkboxRequired: z.boolean().refine((val) => val === true, { message: 'This field is required' }),
  textContent: (minLength: number, maxLength: number) => z.string().min(minLength, `Must be at least ${minLength} characters`).max(maxLength, `Must be less than ${maxLength} characters`),
  address: z.object({
    street: z.string().min(1, 'Street address is required').max(255),
    street2: z.string().max(255).optional().or(z.literal('')),
    city: z.string().min(1, 'City is required').max(100),
    state: z.string().min(1, 'State is required').max(100),
    zipCode: z.string().min(1, 'ZIP code is required').regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code'),
    country: z.string().min(1, 'Country is required').max(100),
  }),
};

/**
 * Make all fields in a schema optional.
 */
export function makeOptional<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  return schema.partial();
}

/**
 * Pick specific fields from a schema.
 */
export function pickFields<T extends z.ZodRawShape, K extends keyof T>(
  schema: z.ZodObject<T>,
  keys: K[]
) {
  const picked = {} as Pick<T, K>;
  keys.forEach((key) => { picked[key] = schema.shape[key]; });
  return z.object(picked);
}
