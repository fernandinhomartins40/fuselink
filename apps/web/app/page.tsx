import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Link as LinkIcon, BarChart3, Palette, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <LinkIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              FuseLink
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Recursos
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
              Preços
            </Link>
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
              Entrar
            </Link>
            <Link href="/register">
              <Button>Começar</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            O Único Link Que Você Precisa
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Compartilhe todo seu conteúdo, produtos e redes sociais em uma página linda.
            Perfeito para criadores, influenciadores e empresas.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Começar Grátis <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Ver Demo
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Sem cartão de crédito • Configure em 5 minutos
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Tudo Que Você Precisa
          </h2>
          <p className="text-xl text-muted-foreground">
            Recursos poderosos para destacar seu conteúdo
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<LinkIcon className="w-8 h-8" />}
            title="Links Ilimitados"
            description="Adicione quantos links quiser. Organize-os com coleções e agendamentos."
          />
          <FeatureCard
            icon={<Palette className="w-8 h-8" />}
            title="Personalização Total"
            description="Escolha entre temas lindos ou crie o seu próprio com cores, fontes e fundos personalizados."
          />
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8" />}
            title="Análises Avançadas"
            description="Acompanhe visualizações, cliques e entenda sua audiência com insights detalhados."
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Ultrarrápido"
            description="Otimizado para velocidade e desempenho. Sua página carrega instantaneamente."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Pronto Para Começar?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Junte-se a milhares de criadores usando FuseLink
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Crie Seu FuseLink <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-primary to-secondary rounded-lg"></div>
              <span className="font-bold">FuseLink</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 FuseLink. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-card border rounded-2xl p-6 hover:shadow-lg transition-shadow">
      <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
