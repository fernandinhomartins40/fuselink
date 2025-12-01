import { Router } from 'express'
import { getOverview, trackPageView, trackLinkClick, getChartData, getReferrers, getLocations, getDevices, exportAnalytics } from '../controllers/analytics.controller'
import { authenticate, optionalAuth } from '../middleware/auth.middleware'

const router = Router()

router.get('/overview', authenticate, getOverview)
router.get('/chart', authenticate, getChartData)
router.get('/referrers', authenticate, getReferrers)
router.get('/locations', authenticate, getLocations)
router.get('/devices', authenticate, getDevices)
router.get('/export', authenticate, exportAnalytics)
router.post('/track-view', optionalAuth, trackPageView)
router.post('/track-click', optionalAuth, trackLinkClick)

export default router
