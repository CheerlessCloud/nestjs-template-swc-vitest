/* eslint-disable @typescript-eslint/no-explicit-any */
import { createLogger, format, transports, Logform } from 'winston';
import { LEVEL, MESSAGE, SPLAT } from 'triple-beam';
import { IncomingMessage } from 'http';
import { Request } from 'express';
import { inspect } from 'util';

// TODO: build better logger with out-of-the-box support for context sharing and proper serialization

function getLogFieldsSerializer(isPrettyOutput: boolean) {
  function serializeFields(value: unknown, visited: Set<unknown>): unknown {
    switch (true) {
      case ['string', 'number', 'boolean', 'null', 'undefined'].includes(typeof value):
        return value;
      case value instanceof IncomingMessage:
        visited.add(value);
        return serializeHttpRequest(value as Partial<Request>);
      case value instanceof Error:
        visited.add(value);
        return serializeError(value as Error, visited);
      case Array.isArray(value):
        return Array.from(value as []).map((i) => serializeFieldsWithIRP(i, visited));
      case typeof value === 'object' && value !== null:
        return Object.entries(value as Record<string, unknown>).reduce(
          (acc, [key, value]) => {
            acc[key] = serializeFieldsWithIRP(value, visited);
            return acc;
          },
          {} as Record<string, unknown>,
        );
      default:
        return value;
    }
  }

  function serializeFieldsWithIRP(value: unknown, visitedBefore: Set<unknown>): unknown {
    if (visitedBefore.has(value)) {
      return '[Circular]';
    }

    const visitedNext = new Set(visitedBefore);
    visitedNext.add(value);

    const serialized = serializeFields(value, visitedNext);
    return serialized;
  }

  function serializeHttpRequest(req: Partial<Request>) {
    const headers = Object.assign({}, req.headers);

    for (const key of Object.keys(headers)) {
      if (key.startsWith('sec-ch-ua') || key.startsWith('sec-fetch') || key === 'connection') {
        delete headers[key];
      }
    }

    if (headers?.authorization) {
      const firstPart = headers.authorization.slice(0, 10);
      const lastPart = headers.authorization.slice(-4);
      const middlePart = `<redacted ${headers.authorization.length - 14} symbols>`;
      headers.authorization = `${firstPart}${middlePart}${lastPart}`;
    }

    return {
      method: req.method,
      url: req.originalUrl || req.url,
      headers,
      routePath: req.route?.path,
      routeParams: req.params,
      query: req.query,
    };
  }

  function serializeError(value: Error, visited: Set<unknown>) {
    if (isPrettyOutput) {
      return value;
    }

    const error = value as any;

    if (typeof error['toJSON'] === 'function') {
      return error['toJSON']() as unknown;
    }

    return ['name', 'message', 'stack'].concat(Object.getOwnPropertyNames(error)).reduce(
      (acc, key) => {
        acc[key] = serializeFieldsWithIRP(error[key], visited);
        return acc;
      },
      {} as Record<string, unknown>,
    );
  }

  return <T>(value: T): T => {
    return serializeFields(value, new Set()) as T;
  };
}

class SerializedFormat implements Logform.Format {
  private readonly serialize: ReturnType<typeof getLogFieldsSerializer>;

  constructor(isPrettyOutput: boolean) {
    this.serialize = getLogFieldsSerializer(isPrettyOutput);
  }

  public transform(info: Logform.TransformableInfo): Logform.TransformableInfo {
    const serialized = this.serialize(info);
    serialized[LEVEL] = info[LEVEL];
    serialized[SPLAT] = serialized[SPLAT];
    serialized[MESSAGE] = serialized[MESSAGE];
    return serialized;
  }
}

function getFormat() {
  if (process.env.NODE_ENV === 'production') {
    return format.combine(format.timestamp(), new SerializedFormat(false), format.json());
  }

  return format.combine(
    new SerializedFormat(true),
    format.colorize(),
    format.ms(),
    format.printf((info) => {
      const { level, ms, message } = info;
      const dt = new Date().toISOString().replace('T', ' ').slice(0, -1);
      const msWithPadding = `${ms}`.padStart(6, ' ');

      const omitKeys = new Set(['timestamp', 'level', 'ms', 'message', 'service', LEVEL, SPLAT, MESSAGE]);
      const fields: Record<string, unknown> = {};
      for (const key of Object.keys(info)) {
        if (!omitKeys.has(key)) {
          fields[key] = info[key];
        }
      }

      const hasKeys = fields && typeof fields === 'object' && Object.keys(fields).length;
      const asString = hasKeys
        ? ' ' +
          inspect(fields, {
            colors: process.stdout.isTTY && process.stdout.hasColors(),
            showHidden: false,
            showProxy: true,
            depth: 10,
            breakLength: process.stdout.columns - 2,
          })
            .split('\n')
            .join('\n  ')
        : '';

      return `${dt} ${msWithPadding} [${level}]: ${message}${asString}`;
    }),
  );
}

export const loggerSingletonInstance = createLogger({
  level: process.env.LOGGER_LEVEL ?? 'info',
  format: getFormat(),
  defaultMeta: {},
  handleExceptions: true,
  handleRejections: true,
  transports: [
    new transports.Console({
      stderrLevels: ['error'],
      debugStdout: true,
    }),
  ],
});
