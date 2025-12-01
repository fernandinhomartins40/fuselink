import { Router } from 'express'
import { getCollections, createCollection, updateCollection, deleteCollection } from '../controllers/collection.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

router.get('/', authenticate, getCollections)
router.post('/', authenticate, createCollection)
router.put('/:id', authenticate, updateCollection)
router.delete('/:id', authenticate, deleteCollection)

export default router
