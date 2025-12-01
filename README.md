# 🔗 FuseLink - Modern Linktree Clone

<div align="center">

![FuseLink Logo](https://via.placeholder.com/200x200/00D4AA/FFFFFF?text=FuseLink)

**The only link you need. Share all your content in one beautiful page.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Documentation](#-documentation)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Development](#-development)
- [Docker Deployment](#-docker-deployment)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)

---

## ✨ Features

### Core Features
- ✅ **Unlimited Links** - Add, edit, delete, and reorder links
- ✅ **Drag & Drop** - Intuitive link reordering
- ✅ **Link Scheduling** - Schedule links to appear/disappear automatically
- ✅ **Priority Links** - Highlight important links
- ✅ **Featured Layouts** - Expandable link previews
- ✅ **Collections** - Group links in grids, carousels, or lists
- ✅ **Social Links** - Add social media icons to footer

### Customization
- 🎨 **10+ Themes** - Pre-built beautiful themes
- 🎨 **Custom Backgrounds** - Solid colors, gradients, images, or videos
- 🎨 **Button Styles** - Rounded, square, or pill shapes
- 🎨 **Custom Colors** - Full control over colors
- 🎨 **10+ Fonts** - Google Fonts integration
- 🎨 **Profile Customization** - Image or video profile pictures
- 🎨 **Dark Mode** - Built-in dark mode support

### Analytics
- 📊 **Page Views** - Track total and unique views
- 📊 **Link Clicks** - Track clicks per link
- 📊 **Click-Through Rate** - Calculate CTR automatically
- 📊 **Referrer Tracking** - See where traffic comes from
- 📊 **Location Data** - Country and city tracking
- 📊 **Device Analytics** - Mobile, desktop, tablet breakdown
- 📊 **Charts & Graphs** - Beautiful data visualization
- 📊 **Export Data** - Export analytics to CSV

### Advanced Features
- 🚀 **QR Code Generator** - Generate QR code for your page
- 🚀 **Email Collection** - Capture emails from visitors
- 🚀 **UTM Parameters** - Track campaign performance
- 🚀 **Video Embeds** - YouTube, Vimeo, TikTok support
- 🚀 **SEO Optimization** - Custom meta tags and descriptions
- 🚀 **Custom Domain** - Use your own domain (premium)
- 🚀 **API Access** - RESTful API for integrations

---

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **UI Components:** shadcn/ui
- **State Management:** TanStack Query (React Query)
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React
- **Charts:** Recharts
- **Animations:** Framer Motion
- **Drag & Drop:** dnd-kit

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT + bcrypt
- **File Upload:** Multer
- **Validation:** Zod

### Infrastructure
- **Monorepo:** Turborepo
- **Containerization:** Docker + Docker Compose
- **Reverse Proxy:** Nginx
- **Database:** PostgreSQL 16

---

## 🏗 Architecture

```
fuselink/
├── apps/
│   ├── web/                 # Next.js Frontend
│   │   ├── app/            # App Router pages
│   │   ├── components/     # React components
│   │   └── lib/            # Utilities and API client
│   └── api/                # Express Backend
│       ├── src/
│       │   ├── controllers/
│       │   ├── routes/
│       │   ├── middleware/
│       │   └── utils/
│       └── uploads/        # Uploaded files
├── packages/
│   ├── database/           # Prisma schema and client
│   └── types/              # Shared TypeScript types
├── docker/
│   ├── Dockerfile.web
│   ├── Dockerfile.api
│   └── nginx.conf
└── docker-compose.yml
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose (for containerized deployment)
- PostgreSQL 16 (if running locally without Docker)

### Option 1: Docker (Recommended)

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/fuselink.git
cd fuselink
```

2. **Create environment file**
```bash
cp .env.example .env
```

3. **Edit `.env` file** with your configuration (keep defaults for local dev)

4. **Start with Docker Compose**
```bash
docker-compose up -d
```

5. **Run database migrations**
```bash
docker-compose exec api npx prisma migrate deploy
```

6. **Access the application**
- Frontend: http://localhost:8080
- API: http://localhost:8080/api
- Database: localhost:5432

### Option 2: Local Development

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/fuselink.git
cd fuselink
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your local PostgreSQL credentials
```

4. **Run database migrations**
```bash
cd packages/database
npx prisma migrate dev
npx prisma generate
```

5. **Seed the database (optional)**
```bash
npm run db:seed --workspace=@fuselink/database
```

6. **Start development servers**
```bash
npm run dev
```

7. **Access the application**
- Frontend: http://localhost:3000
- API: http://localhost:3001

---

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev              # Start all apps in development mode
npm run dev --workspace=@fuselink/web   # Start only frontend
npm run dev --workspace=@fuselink/api   # Start only backend

# Building
npm run build            # Build all apps for production
npm run build --workspace=@fuselink/web # Build only frontend
npm run build --workspace=@fuselink/api # Build only backend

# Production
npm run start            # Start all apps in production mode

# Database
npm run db:generate --workspace=@fuselink/database   # Generate Prisma Client
npm run db:migrate --workspace=@fuselink/database    # Run migrations
npm run db:studio --workspace=@fuselink/database     # Open Prisma Studio
npm run db:seed --workspace=@fuselink/database       # Seed database

# Linting and Formatting
npm run lint             # Run ESLint
npm run format           # Format code with Prettier

# Docker
npm run docker:up        # Start Docker containers
npm run docker:down      # Stop Docker containers
npm run docker:build     # Rebuild Docker images
```

### Database Migrations

```bash
# Create a new migration
cd packages/database
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (CAUTION: Deletes all data)
npx prisma migrate reset
```

---

## 🐳 Docker Deployment

### Production Deployment

1. **Set environment variables**
```bash
export EXTERNAL_PORT=8080
export POSTGRES_PASSWORD=your_secure_password
export JWT_SECRET=your_jwt_secret
export NEXTAUTH_SECRET=your_nextauth_secret
```

2. **Build and start containers**
```bash
docker-compose up -d --build
```

3. **Run migrations**
```bash
docker-compose exec api npx prisma migrate deploy
```

4. **Check status**
```bash
docker-compose ps
docker-compose logs -f
```

### Accessing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f web
docker-compose logs -f api
docker-compose logs -f postgres
```

### Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (CAUTION: Deletes database data)
docker-compose down -v
```

---

## 🔐 Environment Variables

### Required Variables

```env
# Database
DATABASE_URL=postgresql://fuselink:password@localhost:5432/fuselink
POSTGRES_DB=fuselink
POSTGRES_USER=fuselink
POSTGRES_PASSWORD=change_this_password

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRES_IN=7d

# Next Auth
NEXTAUTH_SECRET=your_nextauth_secret_change_this
NEXTAUTH_URL=http://localhost:3000

# API
API_PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Docker
EXTERNAL_PORT=8080
```

### Optional Variables

```env
# File Upload
MAX_FILE_SIZE=5242880  # 5MB
UPLOAD_DIR=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Analytics
ANALYTICS_RETENTION_DAYS=28
ANALYTICS_RETENTION_DAYS_PREMIUM=365

# CORS
CORS_ORIGIN=*
```

---

## 📚 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login user
POST   /api/auth/refresh           Refresh JWT token
POST   /api/auth/forgot-password   Request password reset
POST   /api/auth/reset-password    Reset password
```

### User Endpoints

```
GET    /api/users/me               Get current user
PUT    /api/users/me               Update user profile
PATCH  /api/users/me/appearance    Update appearance settings
DELETE /api/users/me               Delete account
GET    /api/users/:username/public Get public profile
```

### Links Endpoints

```
GET    /api/links                  Get all links
POST   /api/links                  Create new link
PUT    /api/links/:id              Update link
DELETE /api/links/:id              Delete link
PATCH  /api/links/reorder          Reorder links
GET    /api/links/:id/analytics    Get link analytics
```

### Social Links Endpoints

```
GET    /api/social-links           Get all social links
POST   /api/social-links           Create social link
PUT    /api/social-links/:id       Update social link
DELETE /api/social-links/:id       Delete social link
```

### Analytics Endpoints

```
GET    /api/analytics/overview     Get analytics overview
GET    /api/analytics/chart        Get chart data
GET    /api/analytics/referrers    Get top referrers
GET    /api/analytics/locations    Get location data
GET    /api/analytics/devices      Get device breakdown
GET    /api/analytics/export       Export analytics data
POST   /api/analytics/track-view   Track page view
POST   /api/analytics/track-click  Track link click
```

### Upload Endpoints

```
POST   /api/upload/profile-image   Upload profile image
POST   /api/upload/background      Upload background
POST   /api/upload/link-thumbnail  Upload link thumbnail
POST   /api/upload/icon            Upload custom icon
```

### Collections Endpoints

```
GET    /api/collections            Get all collections
POST   /api/collections            Create collection
PUT    /api/collections/:id        Update collection
DELETE /api/collections/:id        Delete collection
```

### Subscribers Endpoints

```
GET    /api/subscribers            Get all subscribers
POST   /api/subscribers            Add subscriber
DELETE /api/subscribers/:id        Delete subscriber
GET    /api/subscribers/export     Export subscribers
```

---

## 📁 Project Structure

```
fuselink/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── controllers/       # Request handlers
│   │   │   ├── routes/            # API routes
│   │   │   ├── middleware/        # Express middleware
│   │   │   ├── utils/             # Utility functions
│   │   │   └── index.ts           # App entry point
│   │   ├── uploads/               # Uploaded files
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/
│       ├── app/
│       │   ├── (auth)/            # Auth pages
│       │   ├── (dashboard)/       # Dashboard pages
│       │   ├── [username]/        # Public profile
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── globals.css
│       ├── components/
│       │   ├── ui/                # shadcn/ui components
│       │   ├── dashboard/         # Dashboard components
│       │   └── public-page/       # Public page components
│       ├── lib/
│       │   ├── api.ts             # API client
│       │   └── utils.ts           # Utilities
│       ├── package.json
│       ├── next.config.js
│       └── tailwind.config.ts
├── packages/
│   ├── database/
│   │   ├── prisma/
│   │   │   ├── schema.prisma      # Prisma schema
│   │   │   └── seed.ts            # Database seeder
│   │   ├── index.ts
│   │   └── package.json
│   └── types/
│       ├── index.ts               # Shared types
│       └── package.json
├── docker/
│   ├── Dockerfile.api             # API Dockerfile
│   ├── Dockerfile.web             # Frontend Dockerfile
│   └── nginx.conf                 # Nginx configuration
├── docker-compose.yml
├── package.json
├── turbo.json
├── .env.example
└── README.md
```

---

## 🎨 Customization

### Adding New Themes

Edit `apps/web/lib/themes.ts`:

```typescript
export const themes = [
  {
    id: 'ocean',
    name: 'Ocean',
    backgroundColor: '#0077BE',
    buttonColor: '#00D4AA',
    buttonTextColor: '#FFFFFF',
    fontFamily: 'Inter',
  },
  // Add your theme here
]
```

### Adding New Fonts

1. Import in `tailwind.config.ts`
2. Add to font family options
3. Import Google Font in `app/globals.css`

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [shadcn/ui](https://ui.shadcn.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Express](https://expressjs.com/)

---

## 📧 Support

For support, email support@fuselink.com or join our Discord server.

---

<div align="center">

**Made with ❤️ by the FuseLink Team**

[Website](https://fuselink.com) • [Documentation](https://docs.fuselink.com) • [Discord](https://discord.gg/fuselink)

</div>
