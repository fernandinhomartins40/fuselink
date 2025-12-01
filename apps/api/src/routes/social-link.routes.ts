import { Router } from 'express'
import { getSocialLinks, createSocialLink, updateSocialLink, deleteSocialLink } from '../controllers/social-link.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

router.get('/', authenticate, getSocialLinks)
router.post('/', authenticate, createSocialLink)
router.put('/:id', authenticate, updateSocialLink)
router.delete('/:id', authenticate, deleteSocialLink)

export default router
