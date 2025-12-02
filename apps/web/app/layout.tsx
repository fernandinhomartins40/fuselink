import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FuseLink - Seu Link na Bio',
  description: 'O único link que você precisa. Compartilhe todo seu conteúdo, produtos e redes sociais em um só lugar.',
  keywords: ['link na bio', 'redes sociais', 'ferramentas para criadores', 'fuselink'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
