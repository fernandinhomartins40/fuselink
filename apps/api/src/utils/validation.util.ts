import { z } from 'zod'

// Auth validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  name: z.string().min(1, 'Name is required'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
})

// User validation schemas
export const updateUserSchema = z.object({
  name: z.string().optional(),
  bio: z.string().max(500, 'Bio must be at most 500 characters').optional(),
  profileImage: z.string().url().optional().or(z.literal('')),
  profileVideo: z.string().url().optional().or(z.literal('')),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  googleAnalyticsId: z.string().optional(),
  facebookPixel: z.string().optional(),
  isPublic: z.boolean().optional(),
})

export const updateAppearanceSchema = z.object({
  theme: z.string().optional(),
  backgroundColor: z.string().optional(),
  backgroundType: z.enum(['color', 'gradient', 'image', 'video']).optional(),
  backgroundValue: z.string().optional(),
  buttonStyle: z.enum(['rounded', 'square', 'pill']).optional(),
  buttonColor: z.string().optional(),
  buttonTextColor: z.string().optional(),
  buttonShadow: z.boolean().optional(),
  fontFamily: z.string().optional(),
  fontSize: z.string().optional(),
  customLogo: z.string().optional(),
  favicon: z.string().optional(),
})

// Link validation schemas
export const createLinkSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  url: z.string().url('Invalid URL'),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
  thumbnail: z.string().optional(),
  isPriority: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  embedType: z.enum(['youtube', 'vimeo', 'tiktok']).optional(),
  embedUrl: z.string().url().optional(),
  scheduleStart: z.string().datetime().optional(),
  scheduleEnd: z.string().datetime().optional(),
  collectionId: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
})

export const updateLinkSchema = createLinkSchema.partial().extend({
  isActive: z.boolean().optional(),
})

export const reorderLinksSchema = z.object({
  links: z.array(
    z.object({
      id: z.string(),
      order: z.number(),
    })
  ),
})

// Social link validation schemas
export const createSocialLinkSchema = z.object({
  platform: z.string().min(1, 'Platform is required'),
  url: z.string().url('Invalid URL'),
  icon: z.string().optional(),
})

export const updateSocialLinkSchema = createSocialLinkSchema.partial().extend({
  isActive: z.boolean().optional(),
})

// Collection validation schemas
export const createCollectionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  layout: z.enum(['grid', 'carousel', 'list']).optional(),
})

export const updateCollectionSchema = createCollectionSchema.partial().extend({
  isActive: z.boolean().optional(),
})

// Subscriber validation schemas
export const createSubscriberSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  source: z.string().optional(),
  tags: z.array(z.string()).optional(),
})
