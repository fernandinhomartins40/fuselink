import { Router } from 'express'
import {
  getMe,
  updateMe,
  updateAppearance,
  getUserById,
  deleteAccount,
} from '../controllers/user.controller'
import { authenticate, optionalAuth } from '../middleware/auth.middleware'

const router = Router()

router.get('/me', authenticate, getMe)
router.put('/me', authenticate, updateMe)
router.patch('/me/appearance', authenticate, updateAppearance)
router.delete('/me', authenticate, deleteAccount)
router.get('/:userId/public', optionalAuth, getUserById)

export default router
