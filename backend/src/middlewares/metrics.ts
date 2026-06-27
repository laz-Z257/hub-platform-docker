import type { Request, Response, NextFunction } from "express";

interface MetricEntry {
  method: string;
  path: string;
  status: number;
  duration: number;
  timestamp: string;
}

const MAX_METRICS = 1000;
const metrics: MetricEntry[] = [];
let requestCount = 0;
let errorCount = 0;

export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const start = Date.now();
  requestCount++;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (res.statusCode >= 400) errorCount++;

    const entry: MetricEntry = {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration,
      timestamp: new Date().toISOString(),
    };

    metrics.push(entry);
    if (metrics.length > MAX_METRICS) metrics.shift();
  });

  next();
}

export function getMetrics() {
  const avgDuration =
    metrics.length > 0
      ? Math.round(
          metrics.reduce((s, m) => s + m.duration, 0) / metrics.length
        )
      : 0;

  const byPath: Record<string, { count: number; errors: number }> = {};
  for (const m of metrics) {
    const key = `${m.method} ${m.path.split("?")[0]}`;
    if (!byPath[key]) byPath[key] = { count: 0, errors: 0 };
    byPath[key].count++;
    if (m.status >= 400) byPath[key].errors++;
  }

  const recent =
    metrics.length > 50
      ? metrics.slice(-50).reverse()
      : [...metrics].reverse();

  return {
    uptime: process.uptime(),
    totalRequests: requestCount,
    totalErrors: errorCount,
    avgResponseTime: avgDuration,
    currentMemory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    byPath,
    recent,
  };
}
