import jwt, { SignOptions } from 'jsonwebtoken'
import type { StringValue } from 'ms'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as StringValue

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export const generateRefreshToken = (userId: string): string => {
  const options: SignOptions = { expiresIn: '30d' }
  return jwt.sign({ userId }, JWT_SECRET, options)
}

export const verifyToken = (token: string): { userId: string } => {
  return jwt.verify(token, JWT_SECRET) as { userId: string }
}
