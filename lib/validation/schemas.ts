import { z } from 'zod'

// User registration schema
export const registrationSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long').trim(),
  city: z.string().max(100, 'City name too long').trim().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').trim().optional()
})

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required')
})

// Battleplan schema
export const battleplanSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long').trim(),
  priority: z.string().min(3, 'Priority must be at least 3 characters').max(200, 'Priority too long').trim(),
  priority_description: z.string().max(1000, 'Description too long').trim().optional(),
  duration: z.enum(['30', '60', '90']),
  
  // Pillar objectives
  interiority_objective: z.string().min(3, 'Objective required').max(500, 'Objective too long').trim(),
  relationships_objective: z.string().min(3, 'Objective required').max(500, 'Objective too long').trim(),
  resources_objective: z.string().min(3, 'Objective required').max(500, 'Objective too long').trim(),
  health_objective: z.string().min(3, 'Objective required').max(500, 'Objective too long').trim(),
  
  // Routines (optional)
  interiority_routines: z.string().max(1000, 'Routines too long').trim().optional(),
  relationships_routines: z.string().max(1000, 'Routines too long').trim().optional(),
  resources_routines: z.string().max(1000, 'Routines too long').trim().optional(),
  health_routines: z.string().max(1000, 'Routines too long').trim().optional(),
})

// Logbook entry schema
export const logbookEntrySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long').trim(),
  content: z.string().min(10, 'Content must be at least 10 characters').max(10000, 'Content too long'),
  meeting_date: z.string().date().optional().or(z.literal('')),
  group_id: z.string().uuid('Invalid group ID')
})

// UUID validation
export const uuidSchema = z.string().uuid('Invalid ID format')

// Sanitize HTML to prevent XSS
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// Sanitize for SQL (though Supabase parameterized queries handle this)
export function sanitizeForDb(input: string): string {
  return input.trim()
}