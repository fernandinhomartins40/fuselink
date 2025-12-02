import { Response, NextFunction } from 'express'
import { prisma } from '@fuselink/database'
import { AuthRequest } from '../middleware/auth.middleware'
import { AppError } from '../middleware/error.middleware'
import { createCollectionSchema, updateCollectionSchema } from '../utils/validation.util'

export const getCollections = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const collections = await prisma.collection.findMany({
      where: { userId: req.userId },
      include: {
        links: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    })

    res.status(200).json({
      success: true,
      data: collections,
    })
  } catch (error) {
    next(error)
  }
}

export const createCollection = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = createCollectionSchema.parse(req.body)

    const highestOrder = await prisma.collection.findFirst({
      where: { userId: req.userId },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    const collection = await prisma.collection.create({
      data: {
        ...data,
        userId: req.userId!,
        order: (highestOrder?.order || 0) + 1,
      },
    })

    res.status(201).json({
      success: true,
      data: collection,
    })
  } catch (error) {
    next(error)
  }
}

export const updateCollection = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const data = updateCollectionSchema.parse(req.body)

    const existing = await prisma.collection.findUnique({ where: { id } })

    if (!existing || existing.userId !== req.userId) {
      throw new AppError(404, 'Coleção não encontrada')
    }

    const collection = await prisma.collection.update({
      where: { id },
      data,
    })

    res.status(200).json({
      success: true,
      data: collection,
    })
  } catch (error) {
    next(error)
  }
}

export const deleteCollection = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const existing = await prisma.collection.findUnique({ where: { id } })

    if (!existing || existing.userId !== req.userId) {
      throw new AppError(404, 'Coleção não encontrada')
    }

    await prisma.collection.delete({ where: { id } })

    res.status(200).json({
      success: true,
      message: 'Coleção excluída com sucesso',
    })
  } catch (error) {
    next(error)
  }
}
