type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type LogRecord = {
  level: LogLevel;
  message: string;
  service: 'worker';
  timestamp: string;
} & Record<string, unknown>;

export function logRuntime(level: LogLevel, message: string, fields: Record<string, unknown> = {}): void {
  const record: LogRecord = {
    level,
    message,
    service: 'worker',
    timestamp: new Date().toISOString(),
    ...fields,
  };

  const serialized = JSON.stringify(record);

  if (level === 'error' || level === 'warn') {
    process.stderr.write(`${serialized}\n`);
    return;
  }

  process.stdout.write(`${serialized}\n`);
}
