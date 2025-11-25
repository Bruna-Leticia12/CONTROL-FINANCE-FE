# Stage 1: Build da aplicação Angular
FROM node:20-alpine as build

WORKDIR /app

# Copiar apenas package.json e package-lock.json primeiro (cache de dependências)
COPY package*.json ./

# Instalar dependências (usa cache se package.json não mudou)
RUN npm ci --legacy-peer-deps

# Copiar o resto do código
COPY . .

# Build da aplicação em modo produção
RUN npm run build -- --configuration production

# Stage 2: Servir com Nginx
FROM nginx:alpine

# Copiar arquivos buildados do Angular 20+ (caminho: dist/control-finance-fe/browser)
COPY --from=build /app/dist/control-finance-fe/browser /usr/share/nginx/html

# Copiar configuração customizada do nginx para SPA (Single Page Application)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta 80
EXPOSE 80

# Health check (verifica se nginx está respondendo)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
