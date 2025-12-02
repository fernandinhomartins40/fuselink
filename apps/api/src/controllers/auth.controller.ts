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
        throw new AppError(400, 'E-mail já cadastrado')
      }
      throw new AppError(400, 'Nome de usuário já está em uso')
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
      throw new AppError(401, 'Credenciais inválidas')
    }

    // Verify password
    const isValidPassword = await comparePassword(data.password, user.password)

    if (!isValidPassword) {
      throw new AppError(401, 'Credenciais inválidas')
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
      throw new AppError(400, 'Token de atualização necessário')
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
    next(new AppError(401, 'Token de atualização inválido'))
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
        message: 'Se o e-mail existir, um link de redefinição de senha foi enviado',
      })
    }

    // In production, send email with reset token
    // For now, just return success
    const resetToken = generateToken(user.id)

    res.status(200).json({
      success: true,
      message: 'Link de redefinição de senha enviado',
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
      throw new AppError(400, 'Token e senha são necessários')
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
      message: 'Senha redefinida com sucesso',
    })
  } catch (error) {
    next(new AppError(401, 'Token inválido ou expirado'))
  }
}
