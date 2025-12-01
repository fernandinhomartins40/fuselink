import { Router } from 'express'
import {
  getLinks,
  createLink,
  updateLink,
  deleteLink,
  reorderLinks,
  getLinkAnalytics,
} from '../controllers/link.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

router.get('/', authenticate, getLinks)
router.post('/', authenticate, createLink)
router.put('/:id', authenticate, updateLink)
router.delete('/:id', authenticate, deleteLink)
router.patch('/reorder', authenticate, reorderLinks)
router.get('/:id/analytics', authenticate, getLinkAnalytics)

export default router
