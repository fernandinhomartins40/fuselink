'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authAPI } from '@/lib/api'
import { toast } from 'sonner'
import { Link as LinkIcon, Loader2, Check, X } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  })

  // Password strength validation
  const passwordValidation = useMemo(() => {
    const password = formData.password
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      passwordsMatch: formData.password === formData.confirmPassword && formData.confirmPassword !== '',
    }
  }, [formData.password, formData.confirmPassword])

  const isPasswordStrong = useMemo(() => {
    return passwordValidation.minLength &&
           passwordValidation.hasUppercase &&
           passwordValidation.hasLowercase &&
           passwordValidation.hasNumber &&
           passwordValidation.hasSpecialChar
  }, [passwordValidation])

  // Calculate password strength score (0-5)
  const passwordStrength = useMemo(() => {
    let score = 0
    if (passwordValidation.minLength) score++
    if (passwordValidation.hasUppercase) score++
    if (passwordValidation.hasLowercase) score++
    if (passwordValidation.hasNumber) score++
    if (passwordValidation.hasSpecialChar) score++
    return score
  }, [passwordValidation])

  // Get strength label and color
  const getStrengthInfo = (strength: number) => {
    if (strength === 0) return { label: 'Muito fraca', color: 'bg-red-500', width: '0%' }
    if (strength === 1) return { label: 'Muito fraca', color: 'bg-red-500', width: '20%' }
    if (strength === 2) return { label: 'Fraca', color: 'bg-orange-500', width: '40%' }
    if (strength === 3) return { label: 'Média', color: 'bg-yellow-500', width: '60%' }
    if (strength === 4) return { label: 'Boa', color: 'bg-lime-500', width: '80%' }
    return { label: 'Forte', color: 'bg-green-500', width: '100%' }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate password strength
    if (!isPasswordStrong) {
      toast.error('A senha não atende aos requisitos de segurança')
      return
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    setLoading(true)

    try {
      const { confirmPassword, ...registerData } = formData
      const response = await authAPI.register(registerData)

      if (response.data.success) {
        localStorage.setItem('token', response.data.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.data.user))

        toast.success('Conta criada com sucesso!')
        router.push('/dashboard')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Falha no cadastro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <LinkIcon className="w-6 h-6 text-white" />
          </div>
          <span className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            FuseLink
          </span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Criar Conta</CardTitle>
            <CardDescription>Comece com FuseLink gratuitamente</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="João Silva"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  autoComplete="new-password"
                  required
                />
                {formData.password && (
                  <div className="space-y-3 mt-2">
                    {/* Password strength bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Força da senha:</span>
                        <span className={`font-medium ${
                          passwordStrength === 5 ? 'text-green-600' :
                          passwordStrength === 4 ? 'text-lime-600' :
                          passwordStrength === 3 ? 'text-yellow-600' :
                          passwordStrength === 2 ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                          {getStrengthInfo(passwordStrength).label}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${getStrengthInfo(passwordStrength).color}`}
                          style={{ width: getStrengthInfo(passwordStrength).width }}
                        />
                      </div>
                    </div>

                    {/* Password requirements checklist */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        {passwordValidation.minLength ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <X className="h-3 w-3 text-red-500" />
                        )}
                        <span className={passwordValidation.minLength ? 'text-green-600' : 'text-muted-foreground'}>
                          Mínimo 8 caracteres
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {passwordValidation.hasUppercase ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <X className="h-3 w-3 text-red-500" />
                        )}
                        <span className={passwordValidation.hasUppercase ? 'text-green-600' : 'text-muted-foreground'}>
                          Uma letra maiúscula
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {passwordValidation.hasLowercase ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <X className="h-3 w-3 text-red-500" />
                        )}
                        <span className={passwordValidation.hasLowercase ? 'text-green-600' : 'text-muted-foreground'}>
                          Uma letra minúscula
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {passwordValidation.hasNumber ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <X className="h-3 w-3 text-red-500" />
                        )}
                        <span className={passwordValidation.hasNumber ? 'text-green-600' : 'text-muted-foreground'}>
                          Um número
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {passwordValidation.hasSpecialChar ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <X className="h-3 w-3 text-red-500" />
                        )}
                        <span className={passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-muted-foreground'}>
                          Um caractere especial (!@#$%^&*...)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  autoComplete="new-password"
                  required
                />
                {formData.confirmPassword && (
                  <div className="flex items-center gap-2 text-xs mt-1">
                    {passwordValidation.passwordsMatch ? (
                      <>
                        <Check className="h-3 w-3 text-green-500" />
                        <span className="text-green-600">As senhas coincidem</span>
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3 text-red-500" />
                        <span className="text-red-500">As senhas não coincidem</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !isPasswordStrong || !passwordValidation.passwordsMatch}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  'Criar Conta'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Já tem uma conta? </span>
              <Link href="/login" className="text-primary hover:underline font-medium">
                Entrar
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
