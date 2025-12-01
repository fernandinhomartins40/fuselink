// User Types
export interface User {
  id: string
  email: string
  username: string
  name?: string
  bio?: string
  profileImage?: string
  profileVideo?: string
  theme?: string
  backgroundColor?: string
  backgroundType?: string
  backgroundValue?: string
  buttonStyle?: string
  buttonColor?: string
  buttonTextColor?: string
  buttonShadow?: boolean
  fontFamily?: string
  fontSize?: string
  removeBranding?: boolean
  isPublic?: boolean
  customDomain?: string
  metaTitle?: string
  metaDescription?: string
  googleAnalyticsId?: string
  facebookPixel?: string
  favicon?: string
  customLogo?: string
  plan: string
  planExpiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface UserPublic {
  id: string
  username: string
  name?: string
  bio?: string
  profileImage?: string
  profileVideo?: string
  theme?: string
  backgroundColor?: string
  backgroundType?: string
  backgroundValue?: string
  buttonStyle?: string
  buttonColor?: string
  buttonTextColor?: string
  buttonShadow?: boolean
  fontFamily?: string
  fontSize?: string
  removeBranding?: boolean
  customLogo?: string
}

// Link Types
export interface Link {
  id: string
  userId: string
  title: string
  url: string
  description?: string
  icon?: string
  thumbnail?: string
  customIcon?: string
  isActive: boolean
  isPriority: boolean
  isFeatured: boolean
  embedType?: string
  embedUrl?: string
  scheduleStart?: Date
  scheduleEnd?: Date
  order: number
  collectionId?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  createdAt: Date
  updatedAt: Date
}

// Collection Types
export interface Collection {
  id: string
  userId: string
  name: string
  layout: string
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Social Link Types
export interface SocialLink {
  id: string
  userId: string
  platform: string
  url: string
  icon?: string
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Analytics Types
export interface PageView {
  id: string
  userId: string
  referrer?: string
  country?: string
  city?: string
  region?: string
  device?: string
  browser?: string
  os?: string
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  isUnique: boolean
  createdAt: Date
}

export interface LinkClick {
  id: string
  linkId: string
  referrer?: string
  country?: string
  city?: string
  region?: string
  device?: string
  browser?: string
  os?: string
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  isUnique: boolean
  timeToClick?: number
  createdAt: Date
}

export interface AnalyticsOverview {
  totalViews: number
  totalClicks: number
  uniqueViews: number
  uniqueClicks: number
  ctr: number
  averageTimeToClick: number
}

export interface AnalyticsChart {
  date: string
  views: number
  clicks: number
  uniqueViews?: number
  uniqueClicks?: number
}

export interface TopLink {
  linkId: string
  title: string
  url: string
  clicks: number
  ctr: number
}

export interface ReferrerStat {
  referrer: string
  count: number
  percentage: number
}

export interface LocationStat {
  country?: string
  city?: string
  count: number
  percentage: number
}

export interface DeviceStat {
  device: string
  count: number
  percentage: number
}

// Email Subscriber Types
export interface EmailSubscriber {
  id: string
  userId: string
  email: string
  phone?: string
  source?: string
  tags: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Auth Types
export interface AuthResponse {
  token: string
  refreshToken?: string
  user: User
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  username: string
  name?: string
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Theme Types
export interface Theme {
  id: string
  name: string
  backgroundColor: string
  backgroundType: string
  backgroundValue?: string
  buttonStyle: string
  buttonColor: string
  buttonTextColor: string
  buttonShadow: boolean
  fontFamily: string
  preview?: string
}

// Plan Types
export interface Plan {
  id: string
  name: string
  price: number
  interval: 'month' | 'year'
  features: string[]
  analyticsRetentionDays: number
  customBranding: boolean
  maxLinks: number
  customDomain: boolean
  prioritySupport: boolean
}

// UTM Parameters
export interface UTMParams {
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
}
