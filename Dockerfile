FROM node:23-alpine AS builder

# Instalar OpenSSL e dependências de compilação
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files and install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy the rest of the application and build
COPY . .
RUN yarn build

RUN npx prisma generate

EXPOSE 3001

CMD ["node", "dist/main"]