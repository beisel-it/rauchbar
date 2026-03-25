import { getWorkerRuntimeConfig } from './runtime/config.ts';
import { createWorkerHttpServer } from './runtime/http.ts';
import { logRuntime } from './runtime/logging.ts';

export async function startWorkerService(): Promise<void> {
  const config = getWorkerRuntimeConfig();
  const { server, setReady } = createWorkerHttpServer(config);

  server.on('error', (error) => {
    logRuntime('error', 'worker-runtime-error', {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exitCode = 1;
  });

  await new Promise<void>((resolve) => {
    server.listen(config.port, config.host, () => {
      setReady(true);
      logRuntime('info', 'worker-runtime-started', {
        host: config.host,
        port: config.port,
        workerRole: config.workerRole,
        scraperJobQueue: config.scraperJobQueue,
        queueConcurrency: config.queueConcurrency,
        healthPath: '/healthz',
        readyPath: '/readyz',
      });
      resolve();
    });
  });
}

const isMainModule = process.argv[1]?.endsWith('/src/service.ts');

if (isMainModule) {
  void startWorkerService();
}
