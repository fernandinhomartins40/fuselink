import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { authenticate } from '../middleware/auth.middleware'
import { uploadFile } from '../controllers/upload.controller'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  },
})

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|webm/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (extname && mimetype) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type. Only images and videos are allowed.'))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
  },
})

const router = Router()

router.post('/profile-image', authenticate, upload.single('file'), uploadFile)
router.post('/background', authenticate, upload.single('file'), uploadFile)
router.post('/link-thumbnail', authenticate, upload.single('file'), uploadFile)
router.post('/icon', authenticate, upload.single('file'), uploadFile)

export default router
