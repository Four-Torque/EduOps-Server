FROM node:20 AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y build-essential python3

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

ENV PRISMA_CLI_BINARY_TARGETS="native,linux-musl-openssl-3.0.x"
RUN npx prisma generate

RUN yarn build

FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

ENV NODE_ENV=production
EXPOSE 8000

CMD ["node", "dist/main"]