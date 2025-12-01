import { Router } from 'express'
import { register, login, refreshToken, forgotPassword, resetPassword } from '../controllers/auth.controller'
import { authRateLimiter } from '../middleware/rate-limit.middleware'

const router = Router()

router.post('/register', authRateLimiter, register)
router.post('/login', authRateLimiter, login)
router.post('/refresh', refreshToken)
router.post('/forgot-password', authRateLimiter, forgotPassword)
router.post('/reset-password', authRateLimiter, resetPassword)

export default router
