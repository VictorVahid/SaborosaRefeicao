# --- ESTÁGIO 1: Instalação de dependências ---
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copia arquivos de dependências
COPY package.json package-lock.json* ./
RUN npm install

# --- ESTÁGIO 2: Build do projeto ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variáveis "falsas" apenas para o Next.js não reclamar no build estático
# No Docker, as variáveis reais a gente passa no "docker run"
ENV NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder
ENV NEXT_TELEMETRY_DISABLED 1

# Executa o build pulando o Lint e Typecheck (já que você já resolveu no VS Code)
RUN npm run build

# --- ESTÁGIO 3: Runner (Imagem final leve) ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Criamos um usuário para não rodar como root (segurança)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiamos apenas o necessário do estágio de builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]