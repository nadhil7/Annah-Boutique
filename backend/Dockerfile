FROM node:22-alpine
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend ./backend
RUN pnpm install --no-frozen-lockfile
ARG SERVICE
ENV SERVICE_NAME=$SERVICE
CMD ["sh","-c","pnpm --filter @annah/${SERVICE} start"]
