FROM node:22-bookworm-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production
ENV PORT=8080
ENV LOG_LEVEL=info
ENV WORKER_ROLE=scrape-service
ENV SCRAPER_JOB_QUEUE=scraper-jobs
ENV QUEUE_CONCURRENCY=4

WORKDIR /workspace

RUN corepack enable

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages
COPY pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["node", "--experimental-strip-types", "apps/worker/src/healthcheck.ts"]

CMD ["pnpm", "--filter", "@rauchbar/worker", "start"]
