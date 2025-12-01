import { Response, NextFunction } from 'express'
import { prisma } from '@fuselink/database'
import { AuthRequest } from '../middleware/auth.middleware'
import { AppError } from '../middleware/error.middleware'
import { createSocialLinkSchema, updateSocialLinkSchema } from '../utils/validation.util'

export const getSocialLinks = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const socialLinks = await prisma.socialLink.findMany({
      where: { userId: req.userId },
      orderBy: { order: 'asc' },
    })

    res.status(200).json({
      success: true,
      data: socialLinks,
    })
  } catch (error) {
    next(error)
  }
}

export const createSocialLink = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = createSocialLinkSchema.parse(req.body)

    const highestOrder = await prisma.socialLink.findFirst({
      where: { userId: req.userId },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    const socialLink = await prisma.socialLink.create({
      data: {
        ...data,
        userId: req.userId!,
        order: (highestOrder?.order || 0) + 1,
      },
    })

    res.status(201).json({
      success: true,
      data: socialLink,
    })
  } catch (error) {
    next(error)
  }
}

export const updateSocialLink = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const data = updateSocialLinkSchema.parse(req.body)

    const existing = await prisma.socialLink.findUnique({ where: { id } })

    if (!existing || existing.userId !== req.userId) {
      throw new AppError(404, 'Social link not found')
    }

    const socialLink = await prisma.socialLink.update({
      where: { id },
      data,
    })

    res.status(200).json({
      success: true,
      data: socialLink,
    })
  } catch (error) {
    next(error)
  }
}

export const deleteSocialLink = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const existing = await prisma.socialLink.findUnique({ where: { id } })

    if (!existing || existing.userId !== req.userId) {
      throw new AppError(404, 'Social link not found')
    }

    await prisma.socialLink.delete({ where: { id } })

    res.status(200).json({
      success: true,
      message: 'Social link deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}
