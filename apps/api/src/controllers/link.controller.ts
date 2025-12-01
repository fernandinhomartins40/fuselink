import { Response, NextFunction } from 'express'
import { prisma } from '@fuselink/database'
import { AuthRequest } from '../middleware/auth.middleware'
import { AppError } from '../middleware/error.middleware'
import { createLinkSchema, updateLinkSchema, reorderLinksSchema } from '../utils/validation.util'
import { startOfDay, endOfDay, subDays } from 'date-fns'

export const getLinks = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const links = await prisma.link.findMany({
      where: { userId: req.userId },
      orderBy: { order: 'asc' },
      include: {
        collection: {
          select: {
            id: true,
            name: true,
            layout: true,
          },
        },
        _count: {
          select: {
            clicks: true,
          },
        },
      },
    })

    res.status(200).json({
      success: true,
      data: links,
    })
  } catch (error) {
    next(error)
  }
}

export const createLink = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = createLinkSchema.parse(req.body)

    // Get the highest order number
    const highestOrder = await prisma.link.findFirst({
      where: { userId: req.userId },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    const link = await prisma.link.create({
      data: {
        ...data,
        userId: req.userId!,
        order: (highestOrder?.order || 0) + 1,
        scheduleStart: data.scheduleStart ? new Date(data.scheduleStart) : undefined,
        scheduleEnd: data.scheduleEnd ? new Date(data.scheduleEnd) : undefined,
      },
    })

    res.status(201).json({
      success: true,
      data: link,
    })
  } catch (error) {
    next(error)
  }
}

export const updateLink = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const data = updateLinkSchema.parse(req.body)

    // Verify ownership
    const existingLink = await prisma.link.findUnique({
      where: { id },
    })

    if (!existingLink) {
      throw new AppError(404, 'Link not found')
    }

    if (existingLink.userId !== req.userId) {
      throw new AppError(403, 'Unauthorized')
    }

    const link = await prisma.link.update({
      where: { id },
      data: {
        ...data,
        scheduleStart: data.scheduleStart ? new Date(data.scheduleStart) : undefined,
        scheduleEnd: data.scheduleEnd ? new Date(data.scheduleEnd) : undefined,
      },
    })

    res.status(200).json({
      success: true,
      data: link,
    })
  } catch (error) {
    next(error)
  }
}

export const deleteLink = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    // Verify ownership
    const existingLink = await prisma.link.findUnique({
      where: { id },
    })

    if (!existingLink) {
      throw new AppError(404, 'Link not found')
    }

    if (existingLink.userId !== req.userId) {
      throw new AppError(403, 'Unauthorized')
    }

    await prisma.link.delete({
      where: { id },
    })

    res.status(200).json({
      success: true,
      message: 'Link deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}

export const reorderLinks = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = reorderLinksSchema.parse(req.body)

    // Update all links in a transaction
    await prisma.$transaction(
      data.links.map((link) =>
        prisma.link.update({
          where: { id: link.id, userId: req.userId },
          data: { order: link.order },
        })
      )
    )

    res.status(200).json({
      success: true,
      message: 'Links reordered successfully',
    })
  } catch (error) {
    next(error)
  }
}

export const getLinkAnalytics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const { days = 7 } = req.query

    // Verify ownership
    const link = await prisma.link.findUnique({
      where: { id },
    })

    if (!link) {
      throw new AppError(404, 'Link not found')
    }

    if (link.userId !== req.userId) {
      throw new AppError(403, 'Unauthorized')
    }

    const startDate = startOfDay(subDays(new Date(), parseInt(days as string)))
    const endDate = endOfDay(new Date())

    // Get total clicks
    const totalClicks = await prisma.linkClick.count({
      where: {
        linkId: id,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    // Get unique clicks
    const uniqueClicks = await prisma.linkClick.count({
      where: {
        linkId: id,
        isUnique: true,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    // Get clicks over time
    const clicksOverTime = await prisma.$queryRaw`
      SELECT DATE(created_at) as date, COUNT(*) as clicks
      FROM "LinkClick"
      WHERE link_id = ${id}
      AND created_at >= ${startDate}
      AND created_at <= ${endDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `

    // Get referrers
    const referrers = await prisma.linkClick.groupBy({
      by: ['referrer'],
      where: {
        linkId: id,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        referrer: {
          not: null,
        },
      },
      _count: true,
      orderBy: {
        _count: {
          referrer: 'desc',
        },
      },
      take: 10,
    })

    // Get devices
    const devices = await prisma.linkClick.groupBy({
      by: ['device'],
      where: {
        linkId: id,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: true,
    })

    res.status(200).json({
      success: true,
      data: {
        totalClicks,
        uniqueClicks,
        clicksOverTime,
        referrers: referrers.map((r: { referrer: string | null; _count: number }) => ({
          referrer: r.referrer,
          count: r._count,
        })),
        devices: devices.map((d: { device: string | null; _count: number }) => ({
          device: d.device,
          count: d._count,
        })),
      },
    })
  } catch (error) {
    next(error)
  }
}
