'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { userAPI, analyticsAPI } from '@/lib/api'
import { Instagram, Twitter, Youtube, Linkedin, Github, Globe } from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'

const socialIcons: any = {
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  linkedin: Linkedin,
  github: Github,
  website: Globe,
}

export default function PublicProfilePage() {
  const params = useParams()
  const username = params.username as string
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (username) {
      loadProfile()
    }
  }, [username])

  const loadProfile = async () => {
    try {
      const response = await userAPI.getUserByUsername(username)
      setData(response.data.data)

      // Track page view
      await analyticsAPI.trackPageView(username)
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLinkClick = async (linkId: string, url: string) => {
    try {
      await analyticsAPI.trackLinkClick(linkId)
    } catch (error) {
      console.error('Failed to track click:', error)
    }
    window.open(url, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-muted-foreground">Usuário não encontrado</p>
        </div>
      </div>
    )
  }

  const backgroundStyle = getBackgroundStyle(data)
  const buttonStyle = getButtonStyle(data)
  const fontFamily = data.fontFamily || 'Inter'

  return (
    <div
      className="min-h-screen py-12 px-4"
      style={{
        ...backgroundStyle,
        fontFamily,
      }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          {/* Profile Image */}
          {data.profileImage && (
            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <Image
                src={data.profileImage}
                alt={data.name}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Name */}
          {data.name && (
            <h1 className="text-3xl font-bold mb-2" style={{ color: data.buttonColor || '#000' }}>
              {data.name}
            </h1>
          )}

          {/* Bio */}
          {data.bio && (
            <p className="text-lg opacity-90 mb-4" style={{ color: data.buttonColor || '#000' }}>
              {data.bio}
            </p>
          )}
        </motion.div>

        {/* Links */}
        <div className="space-y-4 mb-12">
          {data.links?.map((link: any, index: number) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={() => handleLinkClick(link.id, link.url)}
                className="w-full transition-all hover:scale-105 active:scale-95"
                style={buttonStyle}
              >
                <div className="flex items-center justify-center gap-3">
                  {link.icon && <span className="text-xl">{link.icon}</span>}
                  <span className="font-medium">{link.title}</span>
                  {link.isPriority && (
                    <span className="px-2 py-1 bg-yellow-400 text-black text-xs rounded-full font-bold">
                      NEW
                    </span>
                  )}
                </div>
                {link.description && (
                  <p className="text-sm mt-1 opacity-75">{link.description}</p>
                )}
              </button>

              {/* Video Embed */}
              {link.embedType === 'youtube' && link.embedUrl && (
                <div className="mt-4 rounded-lg overflow-hidden">
                  <iframe
                    width="100%"
                    height="315"
                    src={link.embedUrl.replace('watch?v=', 'embed/')}
                    title="YouTube video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Social Links */}
        {data.socialLinks && data.socialLinks.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-4"
          >
            {data.socialLinks.map((social: any) => {
              const Icon = socialIcons[social.platform] || Globe
              return (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                  style={{
                    backgroundColor: data.buttonColor || '#000',
                    color: data.buttonTextColor || '#fff',
                  }}
                >
                  <Icon className="w-5 h-5" />
                </a>
              )
            })}
          </motion.div>
        )}

        {/* Branding */}
        {!data.removeBranding && (
          <div className="text-center mt-12 opacity-60">
            <a
              href="/"
              target="_blank"
              className="text-sm hover:opacity-100 transition-opacity"
              style={{ color: data.buttonColor || '#000' }}
            >
              Crie seu próprio FuseLink
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

function getBackgroundStyle(data: any) {
  switch (data.backgroundType) {
    case 'gradient':
      return {
        background: data.backgroundValue || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }
    case 'image':
      return {
        backgroundImage: `url(${data.backgroundValue})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    case 'color':
      return {
        backgroundColor: data.backgroundColor || '#ffffff',
      }
    default:
      return {
        backgroundColor: data.backgroundColor || '#ffffff',
      }
  }
}

function getButtonStyle(data: any) {
  const baseStyle = {
    backgroundColor: data.buttonColor || '#000000',
    color: data.buttonTextColor || '#ffffff',
    padding: '16px 24px',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'center' as const,
    display: 'block',
    width: '100%',
  }

  switch (data.buttonStyle) {
    case 'rounded':
      return { ...baseStyle, borderRadius: '12px' }
    case 'pill':
      return { ...baseStyle, borderRadius: '999px' }
    case 'square':
      return { ...baseStyle, borderRadius: '0px' }
    default:
      return { ...baseStyle, borderRadius: '8px' }
  }
}
