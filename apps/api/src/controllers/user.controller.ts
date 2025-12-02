import { Response, NextFunction } from 'express'
import { prisma } from '@fuselink/database'
import { AuthRequest } from '../middleware/auth.middleware'
import { AppError } from '../middleware/error.middleware'
import { updateUserSchema, updateAppearanceSchema } from '../utils/validation.util'

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        profileImage: true,
        profileVideo: true,
        theme: true,
        backgroundColor: true,
        backgroundType: true,
        backgroundValue: true,
        buttonStyle: true,
        buttonColor: true,
        buttonTextColor: true,
        buttonShadow: true,
        fontFamily: true,
        fontSize: true,
        removeBranding: true,
        isPublic: true,
        customDomain: true,
        metaTitle: true,
        metaDescription: true,
        googleAnalyticsId: true,
        facebookPixel: true,
        favicon: true,
        customLogo: true,
        plan: true,
        planExpiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      throw new AppError(404, 'Usuário não encontrado')
    }

    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (error) {
    next(error)
  }
}

export const updateMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = updateUserSchema.parse(req.body)

    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        profileImage: true,
        profileVideo: true,
        metaTitle: true,
        metaDescription: true,
        googleAnalyticsId: true,
        facebookPixel: true,
        isPublic: true,
        updatedAt: true,
      },
    })

    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (error) {
    next(error)
  }
}

export const updateAppearance = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = updateAppearanceSchema.parse(req.body)

    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: {
        id: true,
        theme: true,
        backgroundColor: true,
        backgroundType: true,
        backgroundValue: true,
        buttonStyle: true,
        buttonColor: true,
        buttonTextColor: true,
        buttonShadow: true,
        fontFamily: true,
        fontSize: true,
        customLogo: true,
        favicon: true,
        updatedAt: true,
      },
    })

    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (error) {
    next(error)
  }
}

export const getUserById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        bio: true,
        profileImage: true,
        profileVideo: true,
        theme: true,
        backgroundColor: true,
        backgroundType: true,
        backgroundValue: true,
        buttonStyle: true,
        buttonColor: true,
        buttonTextColor: true,
        buttonShadow: true,
        fontFamily: true,
        fontSize: true,
        removeBranding: true,
        customLogo: true,
        isPublic: true,
        links: {
          where: {
            isActive: true,
          },
          orderBy: {
            order: 'asc',
          },
          select: {
            id: true,
            title: true,
            url: true,
            description: true,
            icon: true,
            thumbnail: true,
            isPriority: true,
            isFeatured: true,
            embedType: true,
            embedUrl: true,
            order: true,
            collectionId: true,
          },
        },
        socialLinks: {
          where: {
            isActive: true,
          },
          orderBy: {
            order: 'asc',
          },
          select: {
            id: true,
            platform: true,
            url: true,
            icon: true,
          },
        },
        collections: {
          where: {
            isActive: true,
          },
          orderBy: {
            order: 'asc',
          },
          select: {
            id: true,
            name: true,
            layout: true,
            order: true,
          },
        },
      },
    })

    if (!user) {
      throw new AppError(404, 'Usuário não encontrado')
    }

    if (!user.isPublic && req.userId !== user.id) {
      throw new AppError(403, 'Este perfil é privado')
    }

    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (error) {
    next(error)
  }
}

export const deleteAccount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await prisma.user.delete({
      where: { id: req.userId },
    })

    res.status(200).json({
      success: true,
      message: 'Conta excluída com sucesso',
    })
  } catch (error) {
    next(error)
  }
}
