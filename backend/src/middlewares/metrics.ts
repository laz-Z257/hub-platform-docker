import type { Request, Response, NextFunction } from "express";
import client from "prom-client";

const register = new client.Registry();

client.collectDefaultMetrics({ register });

const httpRequestDurationMicroseconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

const httpRequestTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(httpRequestTotal);

export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const start = process.hrtime();

  res.on("finish", () => {
    const duration = process.hrtime(start);
    const durationInSeconds = duration[0] + duration[1] / 1e9;
    
    const route = req.route?.path || req.originalUrl.split("?")[0];
    const labels = {
      method: req.method,
      route,
      status_code: res.statusCode,
    };

    httpRequestDurationMicroseconds.observe(labels, durationInSeconds);
    httpRequestTotal.inc(labels);
  });

  next();
}

export async function getMetrics(): Promise<string> {
  return register.metrics();
}

export function getMetricsContentType(): string {
  return register.contentType;
}
