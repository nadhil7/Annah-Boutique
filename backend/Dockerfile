FROM node:22-alpine
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend ./backend
COPY scripts ./scripts
RUN pnpm install --frozen-lockfile
CMD ["node", "scripts/start-backend.mjs"]
