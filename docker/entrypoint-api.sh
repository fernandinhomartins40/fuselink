#!/bin/sh
set -e

echo "🚀 Iniciando FuseLink API..."

# Aguardar o PostgreSQL estar pronto
echo "⏳ Aguardando PostgreSQL..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if echo "SELECT 1;" | npx prisma db execute --schema=./packages/database/prisma/schema.prisma --stdin 2>/dev/null; then
    echo "✅ PostgreSQL está pronto!"
    break
  fi
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "PostgreSQL não está pronto - tentativa $RETRY_COUNT/$MAX_RETRIES..."
  sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "❌ ERRO: PostgreSQL não está respondendo após $MAX_RETRIES tentativas!"
  exit 1
fi

# Executar migrations do Prisma
echo "🔄 Executando migrations do Prisma..."
cd /app
npx prisma migrate deploy --schema=./packages/database/prisma/schema.prisma

if [ $? -eq 0 ]; then
  echo "✅ Migrations executadas com sucesso!"
else
  echo "❌ ERRO: Falha ao executar migrations!"
  exit 1
fi

# Seed é opcional e pode ser executado manualmente se necessário
# Para executar seed: docker exec fuselink-api sh -c "cd /app/packages/database && npx tsx prisma/seed.ts"

# Iniciar aplicação
echo "🚀 Iniciando servidor API..."
cd /app
exec node dist/index.js
