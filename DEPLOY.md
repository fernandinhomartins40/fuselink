# 🚀 Guia de Deploy FuseLink na VPS

## 📋 Informações da Configuração

- **Domínios:** fuselink.com.br, www.fuselink.com.br
- **Porta Externa:** 3200
- **VPS IP:** 72.60.10.112
- **Secret GitHub:** VPS_PASSWORD (já configurada)

## 🔧 Configuração Inicial (Uma única vez)

### 1. Preparar DNS

Aponte os domínios para o IP da VPS:

```
A    fuselink.com.br      -> 72.60.10.112
A    www.fuselink.com.br  -> 72.60.10.112
```

### 2. Instalar Dependências na VPS (se ainda não estiver)

```bash
ssh root@72.60.10.112

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
apt-get install docker-compose-plugin

# Instalar certbot (para SSL)
apt-get install certbot python3-certbot-nginx
```

### 3. Configurar GitHub Actions

O arquivo `.github/workflows/deploy-vps.yml` já está pronto!

Apenas certifique-se que a secret `VPS_PASSWORD` está configurada no GitHub:
- Ir em: Repositório → Settings → Secrets and variables → Actions
- Verificar se `VPS_PASSWORD` existe

## 🚢 Deploy Automático

### Via Push no GitHub

```bash
git add .
git commit -m "Deploy FuseLink"
git push origin main
```

O GitHub Actions irá automaticamente:
1. ✅ Sincronizar código para VPS
2. ✅ Construir imagens Docker
3. ✅ Executar migrations do Prisma
4. ✅ Executar seed (se banco vazio)
5. ✅ Configurar Nginx na porta 3200
6. ✅ Iniciar aplicação

### Via Manual Trigger

No GitHub:
1. Ir em: Actions → Deploy FuseLink to VPS
2. Clicar em "Run workflow"
3. Selecionar branch "main"
4. Clicar em "Run workflow"

## 🔐 Configurar SSL (Após Primeiro Deploy)

Conectar na VPS e executar:

```bash
ssh root@72.60.10.112

# Configurar SSL com certbot
certbot --nginx -d fuselink.com.br -d www.fuselink.com.br
```

Responder as perguntas:
- Email para renovação: seu-email@exemplo.com
- Aceitar termos: Y
- Redirecionar HTTP para HTTPS: Y (recomendado)

## ✅ Verificar Deploy

### 1. Verificar se containers estão rodando

```bash
ssh root@72.60.10.112
cd /root/fuselink
docker-compose ps
```

Deve mostrar:
- fuselink-web (running)
- fuselink-api (running)
- fuselink-postgres (running)
- fuselink-nginx (running)

### 2. Verificar health check

```bash
curl http://localhost:3200/health
```

Deve retornar: `{"status":"ok","timestamp":"..."}`

### 3. Acessar no navegador

- https://fuselink.com.br
- https://www.fuselink.com.br

## 👤 Usuário Demo

Se o seed foi executado, existe um usuário demo:

- **Email:** demo@fuselink.com
- **Senha:** password123
- **URL pública:** https://fuselink.com.br/demo

## 📊 Comandos Úteis

### Ver logs

```bash
ssh root@72.60.10.112
cd /root/fuselink

# Logs de todos os containers
docker-compose logs -f

# Logs do frontend
docker logs fuselink-web -f

# Logs do backend
docker logs fuselink-api -f

# Logs do banco
docker logs fuselink-postgres -f
```

### Reiniciar aplicação

```bash
ssh root@72.60.10.112
cd /root/fuselink
docker-compose restart
```

### Parar aplicação

```bash
ssh root@72.60.10.112
cd /root/fuselink
docker-compose down
```

### Iniciar aplicação

```bash
ssh root@72.60.10.112
cd /root/fuselink
docker-compose up -d
```

### Backup do banco de dados

```bash
ssh root@72.60.10.112
cd /root/fuselink

# Criar backup
docker exec fuselink-postgres pg_dump -U fuselink -d fuselink > backup_$(date +%Y%m%d).sql

# Restaurar backup
docker exec -i fuselink-postgres psql -U fuselink -d fuselink < backup_20240101.sql
```

### Executar migrations manualmente

```bash
ssh root@72.60.10.112
cd /root/fuselink

docker exec fuselink-api npx prisma migrate deploy --schema=./packages/database/prisma/schema.prisma
```

### Executar seed manualmente

```bash
ssh root@72.60.10.112
cd /root/fuselink

docker exec fuselink-api sh -c "cd packages/database && npx tsx prisma/seed.ts"
```

## 🔧 Troubleshooting

### Aplicação não inicia

```bash
# Ver logs detalhados
docker logs fuselink-api --tail=100
docker logs fuselink-web --tail=100

# Verificar configurações
cat /root/fuselink/.env
```

### Erro de banco de dados

```bash
# Verificar se PostgreSQL está rodando
docker ps | grep postgres

# Ver logs do PostgreSQL
docker logs fuselink-postgres

# Verificar conexão
docker exec fuselink-postgres psql -U fuselink -d fuselink -c "\dt"
```

### Nginx não responde

```bash
# Verificar status do Nginx
systemctl status nginx

# Ver logs do Nginx
tail -f /var/log/nginx/fuselink-error.log

# Testar configuração
nginx -t

# Recarregar configuração
systemctl reload nginx
```

### Porta 3200 não acessível

```bash
# Verificar se porta está em uso
netstat -tulpn | grep :3200

# Verificar firewall
ufw status
ufw allow 3200
```

## 🔄 Rollback (Se Algo Der Errado)

```bash
ssh root@72.60.10.112
cd /root/fuselink

# Parar containers
docker-compose down

# Restaurar código anterior (GitHub mantém histórico)
# Fazer checkout do commit anterior no GitHub e fazer novo deploy

# OU restaurar backup do banco
docker-compose up -d
docker exec -i fuselink-postgres psql -U fuselink -d fuselink < backups/latest.sql
```

## 📱 Monitoramento

### Verificar uso de recursos

```bash
ssh root@72.60.10.112

# Ver uso de CPU/Memória dos containers
docker stats

# Ver espaço em disco
df -h

# Ver tamanho dos volumes
docker system df -v
```

## 🎯 Checklist de Deploy

- [ ] DNS apontado para VPS (72.60.10.112)
- [ ] Docker e Docker Compose instalados na VPS
- [ ] Secret VPS_PASSWORD configurada no GitHub
- [ ] Push no repositório ou trigger manual
- [ ] Aguardar GitHub Actions completar (5-10 minutos)
- [ ] Verificar containers rodando: `docker-compose ps`
- [ ] Testar health check: `curl http://localhost:3200/health`
- [ ] Configurar SSL: `certbot --nginx -d fuselink.com.br -d www.fuselink.com.br`
- [ ] Acessar no navegador: https://fuselink.com.br
- [ ] Testar login com usuário demo

## 📞 Suporte

Se encontrar problemas:
1. Verificar logs: `docker-compose logs`
2. Verificar status: `docker-compose ps`
3. Verificar GitHub Actions para erros
4. Verificar configuração do Nginx: `nginx -t`

---

**Porta:** 3200
**Domínios:** fuselink.com.br, www.fuselink.com.br
**VPS:** 72.60.10.112
