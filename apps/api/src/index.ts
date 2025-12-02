import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config()

// Import routes
import authRoutes from './routes/auth.routes'
import userRoutes from './routes/user.routes'
import linkRoutes from './routes/link.routes'
import socialLinkRoutes from './routes/social-link.routes'
import analyticsRoutes from './routes/analytics.routes'
import uploadRoutes from './routes/upload.routes'
import subscriberRoutes from './routes/subscriber.routes'
import collectionRoutes from './routes/collection.routes'

// Import middleware
import { errorHandler } from './middleware/error.middleware'
import { rateLimiter } from './middleware/rate-limit.middleware'

const app = express()
const PORT = process.env.PORT || 3001

// Trust proxy - necessário para funcionar atrás do Nginx
app.set('trust proxy', 1)

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}))
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())
app.use(morgan('combined'))

// Apply rate limiting
app.use(rateLimiter)

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/links', linkRoutes)
app.use('/api/social-links', socialLinkRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/subscribers', subscriberRoutes)
app.use('/api/collections', collectionRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Rota não encontrada' })
})

// Error handler
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FuseLink API running on port ${PORT}`)
  console.log(`📝 Environment: ${process.env.NODE_ENV}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/health`)
})

export default app
