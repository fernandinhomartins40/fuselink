import { Request, Response, NextFunction } from 'express'
import { prisma } from '@fuselink/database'
import { AuthRequest } from '../middleware/auth.middleware'
import { AppError } from '../middleware/error.middleware'
import { startOfDay, endOfDay, subDays, format } from 'date-fns'
import {
  extractDeviceInfo,
  extractBrowser,
  extractOS,
  getClientIP,
  getSessionId,
  getLocationFromIP,
} from '../utils/analytics.util'

export const trackPageView = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body

    if (!email) {
      throw new AppError(400, 'Email é necessário')
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (!user) {
      throw new AppError(404, 'Usuário não encontrado')
    }

    const userAgent = req.headers['user-agent'] || ''
    const ip = getClientIP(req)
    const sessionId = getSessionId(req)
    const location = getLocationFromIP(ip)

    // Check if this is a unique view
    const existingView = await prisma.pageView.findFirst({
      where: {
        userId: user.id,
        sessionId,
      },
    })

    await prisma.pageView.create({
      data: {
        userId: user.id,
        referrer: req.headers.referer,
        country: location.country,
        city: location.city,
        region: location.region,
        device: extractDeviceInfo(userAgent),
        browser: extractBrowser(userAgent),
        os: extractOS(userAgent),
        ipAddress: ip,
        userAgent,
        sessionId,
        isUnique: !existingView,
      },
    })

    res.status(200).json({
      success: true,
      message: 'Visualização de página rastreada',
      sessionId,
    })
  } catch (error) {
    next(error)
  }
}

export const trackLinkClick = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { linkId, timeToClick } = req.body

    if (!linkId) {
      throw new AppError(400, 'ID do link é necessário')
    }

    const link = await prisma.link.findUnique({
      where: { id: linkId },
    })

    if (!link) {
      throw new AppError(404, 'Link não encontrado')
    }

    const userAgent = req.headers['user-agent'] || ''
    const ip = getClientIP(req)
    const sessionId = getSessionId(req)
    const location = getLocationFromIP(ip)

    // Check if this is a unique click
    const existingClick = await prisma.linkClick.findFirst({
      where: {
        linkId,
        sessionId,
      },
    })

    await prisma.linkClick.create({
      data: {
        linkId,
        referrer: req.headers.referer,
        country: location.country,
        city: location.city,
        region: location.region,
        device: extractDeviceInfo(userAgent),
        browser: extractBrowser(userAgent),
        os: extractOS(userAgent),
        ipAddress: ip,
        userAgent,
        sessionId,
        isUnique: !existingClick,
        timeToClick,
      },
    })

    res.status(200).json({
      success: true,
      message: 'Clique no link rastreado',
    })
  } catch (error) {
    next(error)
  }
}

export const getOverview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { days = 7 } = req.query

    const startDate = startOfDay(subDays(new Date(), parseInt(days as string)))
    const endDate = endOfDay(new Date())

    const [totalViews, uniqueViews, totalClicks, uniqueClicks] = await Promise.all([
      prisma.pageView.count({
        where: {
          userId: req.userId,
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      prisma.pageView.count({
        where: {
          userId: req.userId,
          isUnique: true,
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      prisma.linkClick.count({
        where: {
          link: { userId: req.userId },
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      prisma.linkClick.count({
        where: {
          link: { userId: req.userId },
          isUnique: true,
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
    ])

    const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0

    // Average time to click
    const avgTimeResult = await prisma.linkClick.aggregate({
      where: {
        link: { userId: req.userId },
        timeToClick: { not: null },
        createdAt: { gte: startDate, lte: endDate },
      },
      _avg: {
        timeToClick: true,
      },
    })

    res.status(200).json({
      success: true,
      data: {
        totalViews,
        uniqueViews,
        totalClicks,
        uniqueClicks,
        ctr: Math.round(ctr * 100) / 100,
        averageTimeToClick: avgTimeResult._avg.timeToClick || 0,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getChartData = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { days = 7 } = req.query
    const numDays = parseInt(days as string)

    const dates = Array.from({ length: numDays }, (_, i) => {
      const date = subDays(new Date(), numDays - 1 - i)
      return format(startOfDay(date), 'yyyy-MM-dd')
    })

    const chartData = await Promise.all(
      dates.map(async (date) => {
        const start = new Date(date)
        const end = endOfDay(start)

        const [views, clicks] = await Promise.all([
          prisma.pageView.count({
            where: {
              userId: req.userId,
              createdAt: { gte: start, lte: end },
            },
          }),
          prisma.linkClick.count({
            where: {
              link: { userId: req.userId },
              createdAt: { gte: start, lte: end },
            },
          }),
        ])

        return {
          date,
          views,
          clicks,
        }
      })
    )

    res.status(200).json({
      success: true,
      data: chartData,
    })
  } catch (error) {
    next(error)
  }
}

export const getReferrers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { days = 7 } = req.query
    const startDate = startOfDay(subDays(new Date(), parseInt(days as string)))

    const referrers = await prisma.pageView.groupBy({
      by: ['referrer'],
      where: {
        userId: req.userId,
        referrer: { not: null },
        createdAt: { gte: startDate },
      },
      _count: true,
      orderBy: {
        _count: {
          referrer: 'desc',
        },
      },
      take: 10,
    })

    const total = referrers.reduce((sum: number, r: { _count: number }) => sum + r._count, 0)

    res.status(200).json({
      success: true,
      data: referrers.map((r: { referrer: string | null; _count: number }) => ({
        referrer: r.referrer,
        count: r._count,
        percentage: total > 0 ? Math.round((r._count / total) * 100 * 100) / 100 : 0,
      })),
    })
  } catch (error) {
    next(error)
  }
}

export const getLocations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { days = 7 } = req.query
    const startDate = startOfDay(subDays(new Date(), parseInt(days as string)))

    const locations = await prisma.pageView.groupBy({
      by: ['country', 'city'],
      where: {
        userId: req.userId,
        country: { not: null },
        createdAt: { gte: startDate },
      },
      _count: true,
      orderBy: {
        _count: {
          country: 'desc',
        },
      },
      take: 10,
    })

    const total = locations.reduce((sum: number, l: { _count: number }) => sum + l._count, 0)

    res.status(200).json({
      success: true,
      data: locations.map((l: { country: string | null; city: string | null; _count: number }) => ({
        country: l.country,
        city: l.city,
        count: l._count,
        percentage: total > 0 ? Math.round((l._count / total) * 100 * 100) / 100 : 0,
      })),
    })
  } catch (error) {
    next(error)
  }
}

export const getDevices = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { days = 7 } = req.query
    const startDate = startOfDay(subDays(new Date(), parseInt(days as string)))

    const devices = await prisma.pageView.groupBy({
      by: ['device'],
      where: {
        userId: req.userId,
        createdAt: { gte: startDate },
      },
      _count: true,
    })

    const total = devices.reduce((sum: number, d: { _count: number }) => sum + d._count, 0)

    res.status(200).json({
      success: true,
      data: devices.map((d: { device: string | null; _count: number }) => ({
        device: d.device,
        count: d._count,
        percentage: total > 0 ? Math.round((d._count / total) * 100 * 100) / 100 : 0,
      })),
    })
  } catch (error) {
    next(error)
  }
}

export const exportAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { days = 30 } = req.query
    const startDate = startOfDay(subDays(new Date(), parseInt(days as string)))

    const [views, clicks] = await Promise.all([
      prisma.pageView.findMany({
        where: {
          userId: req.userId,
          createdAt: { gte: startDate },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.linkClick.findMany({
        where: {
          link: { userId: req.userId },
          createdAt: { gte: startDate },
        },
        include: {
          link: {
            select: {
              title: true,
              url: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ])

    res.status(200).json({
      success: true,
      data: {
        views,
        clicks,
      },
    })
  } catch (error) {
    next(error)
  }
}
