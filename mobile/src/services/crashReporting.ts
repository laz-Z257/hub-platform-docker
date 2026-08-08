import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { logger } from "./logger";

interface CrashReport {
  error: Error;
  componentStack?: string;
  userContext?: Record<string, unknown>;
  tags?: Record<string, string>;
  timestamp: string;
  device: {
    model?: string;
    osVersion?: string;
    platform: string;
    appVersion?: string;
  };
}

let crashReportingEnabled = false;
let dsn: string | null = null;

export function initCrashReporting() {
  const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  
  if (sentryDsn) {
    dsn = sentryDsn;
    crashReportingEnabled = true;
    logger.info("Crash reporting initialized");
  } else {
    logger.info("Crash reporting disabled (no DSN configured)");
  }
}

export function captureException(
  error: Error,
  context?: {
    componentStack?: string;
    userContext?: Record<string, unknown>;
    tags?: Record<string, string>;
  }
) {
  const report: CrashReport = {
    error,
    componentStack: context?.componentStack,
    userContext: context?.userContext,
    tags: context?.tags,
    timestamp: new Date().toISOString(),
    device: {
      model: Device.modelName ?? undefined,
      osVersion: Device.osVersion ?? undefined,
      platform: Platform.OS,
      appVersion: Constants.expoConfig?.version,
    },
  };

  logger.error("Crash report captured", {
    error: error.message,
    stack: error.stack,
    device: report.device,
    tags: report.tags,
  });

  if (crashReportingEnabled && dsn) {
    sendToSentry(report).catch((err) => {
      logger.error("Failed to send crash report", { error: err.message });
    });
  }

  return report;
}

async function sendToSentry(report: CrashReport): Promise<void> {
  if (!dsn) return;

  const [protocolAndPubKey, rest] = dsn.split("@");
  const [host, projectId] = rest.split("/");
  const protocol = protocolAndPubKey.split("://")[0];
  const pubKey = protocolAndPubKey.split("://")[1];

  const eventId = Math.random().toString(36).substring(2, 15);

  const payload = {
    event_id: eventId,
    timestamp: report.timestamp,
    platform: "javascript",
    level: "error",
    exception: {
      values: [
        {
          type: report.error.name,
          value: report.error.message,
          stacktrace: {
            frames: report.error.stack
              ?.split("\n")
              .slice(1)
              .map((line) => ({
                filename: line.trim(),
                function: "unknown",
              })) || [],
          },
        },
      ],
    },
    contexts: {
      device: {
        model: report.device.model,
        os_version: report.device.osVersion,
      },
      app: {
        app_version: report.device.appVersion,
        build_type: __DEV__ ? "debug" : "release",
      },
      os: {
        name: report.device.platform,
        version: report.device.osVersion,
      },
    },
    tags: report.tags || {},
    extra: {
      componentStack: report.componentStack,
      userContext: report.userContext,
    },
  };

  const sentryUrl = `${protocol}://${host}/api/${projectId}/store/`;

  await fetch(sentryUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Sentry-Auth": `Sentry sentry_version=7, sentry_client=hub-mobile/1.0.0, sentry_key=${pubKey}`,
    },
    body: JSON.stringify(payload),
  });
}