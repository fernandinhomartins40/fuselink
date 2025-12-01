import { Request, Response, NextFunction } from 'express'
import { prisma } from '@fuselink/database'
import { AuthRequest } from '../middleware/auth.middleware'
import { AppError } from '../middleware/error.middleware'
import { createSubscriberSchema } from '../utils/validation.util'

export const getSubscribers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const subscribers = await prisma.emailSubscriber.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    })

    res.status(200).json({
      success: true,
      data: subscribers,
    })
  } catch (error) {
    next(error)
  }
}

export const createSubscriber = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createSubscriberSchema.parse(req.body)
    const { userId } = req.body

    if (!userId) {
      throw new AppError(400, 'User ID is required')
    }

    const subscriber = await prisma.emailSubscriber.create({
      data: {
        ...data,
        userId,
      },
    })

    res.status(201).json({
      success: true,
      data: subscriber,
    })
  } catch (error) {
    next(error)
  }
}

export const deleteSubscriber = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const existing = await prisma.emailSubscriber.findUnique({ where: { id } })

    if (!existing || existing.userId !== req.userId) {
      throw new AppError(404, 'Subscriber not found')
    }

    await prisma.emailSubscriber.delete({ where: { id } })

    res.status(200).json({
      success: true,
      message: 'Subscriber deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}

export const exportSubscribers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const subscribers = await prisma.emailSubscriber.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    })

    res.status(200).json({
      success: true,
      data: subscribers,
    })
  } catch (error) {
    next(error)
  }
}
