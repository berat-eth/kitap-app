/**
 * API logları - __DEV__ modunda veya LOG_API=true ile aktif
 */

const LOG_API = process.env.EXPO_PUBLIC_LOG_API === 'true' || __DEV__;

function timestamp(): string {
  return new Date().toISOString();
}

export const apiLogger = {
  request(method: string, endpoint: string, meta?: object): void {
    if (!LOG_API) return;
    const msg = `[API] → ${method} ${endpoint}`;
    if (meta) {
      console.log(`[${timestamp()}] ${msg}`, meta);
    } else {
      console.log(`[${timestamp()}] ${msg}`);
    }
  },

  response(method: string, endpoint: string, status: number, durationMs: number, meta?: object): void {
    if (!LOG_API) return;
    const level = status >= 400 ? 'warn' : 'log';
    const msg = `[API] ← ${method} ${endpoint} ${status} (${durationMs}ms)`;
    if (meta) {
      console[level](`[${timestamp()}] ${msg}`, meta);
    } else {
      console[level](`[${timestamp()}] ${msg}`);
    }
  },

  error(context: string, message: string, error?: unknown): void {
    console.error(`[${timestamp()}] [API] ✗ ${context}: ${message}`, error ?? '');
  },
};
