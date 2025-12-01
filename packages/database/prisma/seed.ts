import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create demo user
  const hashedPassword = await bcrypt.hash('password123', 10)

  const user = await prisma.user.upsert({
    where: { email: 'demo@fuselink.com' },
    update: {},
    create: {
      email: 'demo@fuselink.com',
      password: hashedPassword,
      username: 'demo',
      name: 'Demo User',
      bio: 'Welcome to my FuseLink! Check out all my links below 👇',
      profileImage: '/uploads/demo-avatar.jpg',
      theme: 'default',
      backgroundColor: '#ffffff',
      backgroundType: 'gradient',
      backgroundValue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      buttonStyle: 'rounded',
      buttonColor: '#000000',
      buttonTextColor: '#ffffff',
      fontFamily: 'Inter',
      plan: 'free',
    },
  })

  console.log('✅ User created:', user.username)

  // Create demo links
  const links = [
    {
      title: '🎵 Listen to my latest album',
      url: 'https://spotify.com',
      description: 'Now available on all platforms',
      isPriority: true,
      order: 1,
    },
    {
      title: '📸 Follow me on Instagram',
      url: 'https://instagram.com',
      icon: 'instagram',
      order: 2,
    },
    {
      title: '🎬 Watch my YouTube channel',
      url: 'https://youtube.com',
      embedType: 'youtube',
      embedUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      order: 3,
    },
    {
      title: '🛍️ Shop my merch',
      url: 'https://shop.example.com',
      isFeatured: true,
      order: 4,
    },
    {
      title: '📧 Join my newsletter',
      url: 'https://newsletter.example.com',
      order: 5,
    },
  ]

  for (const linkData of links) {
    await prisma.link.create({
      data: {
        ...linkData,
        userId: user.id,
      },
    })
  }

  console.log('✅ Created', links.length, 'demo links')

  // Create social links
  const socialLinks = [
    { platform: 'instagram', url: 'https://instagram.com/demo', order: 1 },
    { platform: 'twitter', url: 'https://twitter.com/demo', order: 2 },
    { platform: 'youtube', url: 'https://youtube.com/@demo', order: 3 },
    { platform: 'tiktok', url: 'https://tiktok.com/@demo', order: 4 },
  ]

  for (const socialData of socialLinks) {
    await prisma.socialLink.create({
      data: {
        ...socialData,
        userId: user.id,
      },
    })
  }

  console.log('✅ Created', socialLinks.length, 'social links')

  // Create demo analytics
  const now = new Date()
  for (let i = 0; i < 30; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    // Page views
    const views = Math.floor(Math.random() * 100) + 50
    for (let j = 0; j < views; j++) {
      await prisma.pageView.create({
        data: {
          userId: user.id,
          device: ['mobile', 'desktop', 'tablet'][Math.floor(Math.random() * 3)],
          browser: ['Chrome', 'Safari', 'Firefox'][Math.floor(Math.random() * 3)],
          country: ['USA', 'UK', 'Canada'][Math.floor(Math.random() * 3)],
          isUnique: j < views / 2,
          createdAt: date,
        },
      })
    }
  }

  console.log('✅ Created demo analytics')

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
