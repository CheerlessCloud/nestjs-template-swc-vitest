FROM node:22.13-alpine as builder

RUN corepack enable && corepack prepare pnpm@9.x --activate

WORKDIR /usr/src/app

COPY pnpm-lock.yaml package.json .npmrc ./
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY . .
RUN pnpm build
RUN pnpm prune --prod --ignore-scripts

# ==============================

FROM node:22.13-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules

STOPSIGNAL SIGINT

ENV NODE_ENV=production NO_COLOR=true

CMD ["node", "dist/src/main.js"]
