import { Request, Response, NextFunction } from 'express'
import { prisma } from '@fuselink/database'
import { hashPassword, comparePassword } from '../utils/password.util'
import { generateToken, generateRefreshToken, verifyToken } from '../utils/jwt.util'
import { AppError } from '../middleware/error.middleware'
import { registerSchema, loginSchema, forgotPasswordSchema } from '../utils/validation.util'

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body)

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }],
      },
    })

    if (existingUser) {
      if (existingUser.email === data.email) {
        throw new AppError(400, 'Email already registered')
      }
      throw new AppError(400, 'Username already taken')
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        username: data.username,
        name: data.name,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        profileImage: true,
        theme: true,
        plan: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Generate tokens
    const token = generateToken(user.id)
    const refreshToken = generateRefreshToken(user.id)

    res.status(201).json({
      success: true,
      data: {
        token,
        refreshToken,
        user,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = loginSchema.parse(req.body)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (!user) {
      throw new AppError(401, 'Invalid credentials')
    }

    // Verify password
    const isValidPassword = await comparePassword(data.password, user.password)

    if (!isValidPassword) {
      throw new AppError(401, 'Invalid credentials')
    }

    // Generate tokens
    const token = generateToken(user.id)
    const refreshToken = generateRefreshToken(user.id)

    // Remove password from response
    const { password, ...userWithoutPassword } = user

    res.status(200).json({
      success: true,
      data: {
        token,
        refreshToken,
        user: userWithoutPassword,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken: token } = req.body

    if (!token) {
      throw new AppError(400, 'Refresh token required')
    }

    // Verify refresh token
    const decoded = verifyToken(token)

    // Generate new tokens
    const newToken = generateToken(decoded.userId)
    const newRefreshToken = generateRefreshToken(decoded.userId)

    res.status(200).json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
      },
    })
  } catch (error) {
    next(new AppError(401, 'Invalid refresh token'))
  }
}

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = forgotPasswordSchema.parse(req.body)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (!user) {
      // Don't reveal if user exists
      return res.status(200).json({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      })
    }

    // In production, send email with reset token
    // For now, just return success
    const resetToken = generateToken(user.id)

    res.status(200).json({
      success: true,
      message: 'Password reset link sent',
      // In development only:
      ...(process.env.NODE_ENV === 'development' && { resetToken }),
    })
  } catch (error) {
    next(error)
  }
}

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body

    if (!token || !password) {
      throw new AppError(400, 'Token and password required')
    }

    // Verify token
    const decoded = verifyToken(token)

    // Hash new password
    const hashedPassword = await hashPassword(password)

    // Update password
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword },
    })

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    })
  } catch (error) {
    next(new AppError(401, 'Invalid or expired token'))
  }
}
