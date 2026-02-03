# frontend/Dockerfile
FROM node:22-alpine

WORKDIR /app

# Copia os arquivos de dependência do Node
COPY package.json package-lock.json ./

# Instala as dependências
RUN npm ci

# Copia o resto do código
COPY . .

# Porta do Next.js
EXPOSE 3000

# Comando de desenvolvimento (Hot Reload)
CMD ["npm", "run", "dev"]