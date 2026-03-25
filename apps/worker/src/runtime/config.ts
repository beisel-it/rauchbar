export type WorkerRuntimeConfig = {
  host: string;
  port: number;
  logLevel: string;
  workerRole: string;
  scraperJobQueue: string;
  queueConcurrency: number;
};

function parseInteger(value: string | undefined, fallback: number): number {
  const parsed = value ? Number.parseInt(value, 10) : fallback;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getWorkerRuntimeConfig(env: NodeJS.ProcessEnv = process.env): WorkerRuntimeConfig {
  return {
    host: env.HOST || '0.0.0.0',
    port: parseInteger(env.PORT, 8080),
    logLevel: env.LOG_LEVEL || 'info',
    workerRole: env.WORKER_ROLE || 'scrape-service',
    scraperJobQueue: env.SCRAPER_JOB_QUEUE || 'scraper-jobs',
    queueConcurrency: parseInteger(env.QUEUE_CONCURRENCY, 4),
  };
}
