# Arquitetura de Roteamento - FuseLink

## 📋 Visão Geral

Este documento descreve como as requisições HTTP fluem através do sistema FuseLink, desde o frontend até o backend.

## 🔄 Fluxo de Requisições

```
Browser (HTTPS)
    ↓
https://fuselink.com.br/login
    ↓
[Nginx no VPS - Porta 443]
    ↓
https://fuselink.com.br/api/auth/login
    ↓
[Nginx Docker - nginx.conf]
    ↓ (proxy_pass)
http://api:3001/api/auth/login
    ↓
[Express API - index.ts]
    ↓ (app.use('/api/auth'))
/api/auth/login → authRoutes
    ↓
[Auth Controller]
login() → valida credenciais → retorna JWT
```

## 🏗️ Componentes

### 1. Frontend (Next.js)

**Localização:** `apps/web/lib/api.ts`

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export const api = axios.create({
  baseURL: `${API_URL}/api`,  // ← /api adicionado aqui
  headers: {
    'Content-Type': 'application/json',
  },
})

// Chamadas de API
authAPI.login(data) → POST /auth/login
```

**Resultado:**
- Requisição final: `https://fuselink.com.br/api/auth/login`

---

### 2. Nginx Docker (Proxy Reverso)

**Localização:** `docker/nginx.conf`

```nginx
# Rota da API
location /api/ {
    proxy_pass http://api/;  # ← Remove /api do path
    # ...
}
```

**Transformação:**
- Recebe: `/api/auth/login`
- Remove: `/api/`
- Encaminha: `/auth/login` → http://api:3001/auth/login

**IMPORTANTE:** O `/` no final de `proxy_pass http://api/;` remove o prefixo `/api/` do path.

---

### 3. Backend API (Express)

**Localização:** `apps/api/src/index.ts`

```typescript
// Rotas da API COM prefixo /api
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/links', linkRoutes)
app.use('/api/social-links', socialLinkRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/subscribers', subscriberRoutes)
app.use('/api/collections', collectionRoutes)
```

**IMPORTANTE:**
- ❌ **ANTIGA:** Backend recebia `/auth/login` (sem `/api/`)
- ✅ **NOVA:** Backend espera `/api/auth/login` (com `/api/`)
- O Nginx estava removendo o `/api/` mas o backend precisa dele

---

### 4. Rotas de Autenticação

**Localização:** `apps/api/src/routes/auth.routes.ts`

```typescript
const router = Router()

router.post('/register', authRateLimiter, register)
router.post('/login', authRateLimiter, login)
router.post('/refresh', refreshToken)
router.post('/forgot-password', authRateLimiter, forgotPassword)
router.post('/reset-password', authRateLimiter, resetPassword)

export default router
```

**Path completo:**
- `/api/auth` + `/login` = `/api/auth/login`

---

## 🔐 Validação de Senha

### Backend (Zod Schema)

**Localização:** `apps/api/src/utils/validation.util.ts`

```typescript
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  name: z.string().min(1, 'Name is required'),
})
```

### Frontend (React Validation)

**Localização:** `apps/web/app/(auth)/register/page.tsx`

```typescript
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
```

**Requisitos de senha (ambos alinhados):**
- ✅ Mínimo 8 caracteres
- ✅ Pelo menos uma letra maiúscula
- ✅ Pelo menos uma letra minúscula
- ✅ Pelo menos um número
- ✅ Pelo menos um caractere especial

---

## 🌐 Variáveis de Ambiente

### Desenvolvimento Local

**Arquivo:** `.env.example`

```bash
NEXT_PUBLIC_API_URL=http://localhost:3200
NEXTAUTH_URL=http://localhost:3200
```

### Produção

**Arquivo:** `apps/web/.env.production`

```bash
NEXT_PUBLIC_API_URL=https://fuselink.com.br
NEXTAUTH_URL=https://fuselink.com.br
```

**Arquivo:** `docker-compose.yml`

```yaml
web:
  environment:
    NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-http://localhost:3200}
    NEXTAUTH_URL: ${NEXTAUTH_URL:-http://localhost:3200}
```

**IMPORTANTE:**
- Em produção, use HTTPS para evitar Mixed Content Warnings
- As variáveis podem ser sobrescritas via arquivo `.env`

---

## 📊 Exemplos de Requisições

### Registro de Usuário

```
1. Frontend faz: authAPI.register({ email, password, name })
   ↓
2. Axios chama: POST https://fuselink.com.br/api/auth/register
   Body: { email: "user@example.com", password: "MyP@ssw0rd!", name: "John Doe" }
   ↓
3. Nginx Docker encaminha: http://api:3001/api/auth/register
   ↓
4. Express rota /api/auth → authRoutes → POST /register
   ↓
5. Controller valida dados (Zod) → hash password (bcrypt) → cria user (Prisma)
   ↓
6. Retorna: { token, refreshToken, user }
```

### Login de Usuário

```
1. Frontend faz: authAPI.login({ email, password })
   ↓
2. Axios chama: POST https://fuselink.com.br/api/auth/login
   Body: { email: "user@example.com", password: "MyP@ssw0rd!" }
   ↓
3. Nginx Docker encaminha: http://api:3001/api/auth/login
   ↓
4. Express rota /api/auth → authRoutes → POST /login
   ↓
5. Controller busca user → compara password (bcrypt) → gera JWT
   ↓
6. Retorna: { token, refreshToken, user }
```

---

## 🛠️ Troubleshooting

### Problema: 404 Not Found nas rotas da API

**Sintomas:**
```
POST https://fuselink.com.br/auth/login → 404
```

**Causa:**
- Frontend não está adicionando `/api/` na baseURL

**Solução:**
```typescript
// apps/web/lib/api.ts
export const api = axios.create({
  baseURL: `${API_URL}/api`,  // ← Adicionar /api
})
```

---

### Problema: Mixed Content Warning

**Sintomas:**
```
Mixed Content: The page at 'https://fuselink.com.br' was loaded over HTTPS,
but requested an insecure resource 'http://fuselink.com.br/api/auth/login'
```

**Causa:**
- `NEXT_PUBLIC_API_URL` está com `http://` em produção HTTPS

**Solução:**
```bash
# apps/web/.env.production
NEXT_PUBLIC_API_URL=https://fuselink.com.br  # ← Usar HTTPS
```

---

### Problema: Senha aceita no frontend mas rejeitada no backend

**Sintomas:**
```
Frontend: "Senha forte" (verde)
Backend: "Password must contain at least one number"
```

**Causa:**
- Validações desalinhadas entre frontend e backend

**Solução:**
- Ambos agora exigem os mesmos 5 critérios (8 chars, uppercase, lowercase, number, special)

---

## 📝 Checklist de Deploy

Ao fazer deploy em produção, verifique:

- [ ] `NEXT_PUBLIC_API_URL` está com HTTPS
- [ ] `NEXTAUTH_URL` está configurado
- [ ] `JWT_SECRET` foi alterado do valor padrão
- [ ] Nginx do VPS está configurado para HTTPS
- [ ] Certificado SSL está válido
- [ ] CORS está configurado corretamente no backend
- [ ] Rate limiting está ativo
- [ ] Database URL está correta

---

## 🔗 Referências Rápidas

| Componente | Arquivo | Responsabilidade |
|------------|---------|------------------|
| Frontend API Client | `apps/web/lib/api.ts` | Configuração do Axios |
| Nginx Config | `docker/nginx.conf` | Proxy reverso |
| API Routes | `apps/api/src/index.ts` | Registro de rotas |
| Auth Routes | `apps/api/src/routes/auth.routes.ts` | Rotas de autenticação |
| Auth Controller | `apps/api/src/controllers/auth.controller.ts` | Lógica de autenticação |
| Validations | `apps/api/src/utils/validation.util.ts` | Schemas Zod |
| JWT Utils | `apps/api/src/utils/jwt.util.ts` | Geração/verificação de tokens |
| Password Utils | `apps/api/src/utils/password.util.ts` | Hash/comparação de senhas |

---

**Última atualização:** 2025-12-04
**Autor:** Claude Code
