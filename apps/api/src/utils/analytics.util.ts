import { Request } from 'express'
import { v4 as uuidv4 } from 'uuid'

export const extractDeviceInfo = (userAgent: string): string => {
  if (/mobile/i.test(userAgent)) return 'mobile'
  if (/tablet/i.test(userAgent)) return 'tablet'
  return 'desktop'
}

export const extractBrowser = (userAgent: string): string => {
  if (userAgent.includes('Chrome')) return 'Chrome'
  if (userAgent.includes('Safari')) return 'Safari'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Edge')) return 'Edge'
  if (userAgent.includes('Opera')) return 'Opera'
  return 'Unknown'
}

export const extractOS = (userAgent: string): string => {
  if (userAgent.includes('Windows')) return 'Windows'
  if (userAgent.includes('Mac')) return 'macOS'
  if (userAgent.includes('Linux')) return 'Linux'
  if (userAgent.includes('Android')) return 'Android'
  if (userAgent.includes('iOS')) return 'iOS'
  return 'Unknown'
}

export const getClientIP = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim()
  }
  return req.socket.remoteAddress || 'unknown'
}

export const generateSessionId = (): string => {
  return uuidv4()
}

export const getSessionId = (req: Request): string => {
  // Try to get session from cookie
  const sessionCookie = req.cookies?.session_id
  if (sessionCookie) return sessionCookie

  // Generate new session
  return generateSessionId()
}

// Mock geolocation (in production, use a service like MaxMind)
export const getLocationFromIP = (ip: string): { country?: string; city?: string; region?: string } => {
  // This is a mock implementation
  // In production, integrate with a geolocation service
  return {
    country: 'Unknown',
    city: 'Unknown',
    region: 'Unknown',
  }
}
