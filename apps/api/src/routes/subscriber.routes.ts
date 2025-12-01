import { Router } from 'express'
import { getSubscribers, createSubscriber, deleteSubscriber, exportSubscribers } from '../controllers/subscriber.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

router.get('/', authenticate, getSubscribers)
router.post('/', createSubscriber)
router.delete('/:id', authenticate, deleteSubscriber)
router.get('/export', authenticate, exportSubscribers)

export default router
