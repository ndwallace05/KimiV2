import { v4 as uuidv4 } from "uuid";

/**
 * Request context for tracking requests across the application
 */
export interface RequestContext {
  requestId: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
}

/**
 * Log levels enum
 */
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

/**
 * Simple logger compatible with edge runtime
 */
class EdgeLogger {
  private logLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    const level = process.env.LOG_LEVEL || "info";
    this.logLevel = this.parseLogLevel(level);
    this.isDevelopment = process.env.NODE_ENV === "development";
  }

  private parseLogLevel(level: string): LogLevel {
    switch (level.toLowerCase()) {
      case "error": return LogLevel.ERROR;
      case "warn": return LogLevel.WARN;
      case "info": return LogLevel.INFO;
      case "debug": return LogLevel.DEBUG;
      default: return LogLevel.INFO;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  private formatMessage(level: string, message: string, meta: Record<string, any> = {}): string {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta,
    };

    // Remove undefined values
    Object.keys(logEntry).forEach(key => {
      if (logEntry[key as keyof typeof logEntry] === undefined) {
        delete logEntry[key as keyof typeof logEntry];
      }
    });

    if (this.isDevelopment) {
      const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
      const contextStr = meta.requestId ? ` [${meta.requestId}${meta.userId ? `:${meta.userId}` : ""}]` : "";
      return `${timestamp} ${level.toUpperCase()}${contextStr}: ${message}${metaStr}`;
    }

    return JSON.stringify(logEntry);
  }

  error(message: string, meta: Record<string, any> = {}) {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage("error", message, meta));
    }
  }

  warn(message: string, meta: Record<string, any> = {}) {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage("warn", message, meta));
    }
  }

  info(message: string, meta: Record<string, any> = {}) {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage("info", message, meta));
    }
  }

  debug(message: string, meta: Record<string, any> = {}) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage("debug", message, meta));
    }
  }

  log(level: string, message: string, meta: Record<string, any> = {}) {
    switch (level.toLowerCase()) {
      case "error": this.error(message, meta); break;
      case "warn": this.warn(message, meta); break;
      case "info": this.info(message, meta); break;
      case "debug": this.debug(message, meta); break;
      default: this.info(message, meta);
    }
  }

  child(context: Record<string, any>) {
    return {
      error: (message: string, meta: Record<string, any> = {}) => this.error(message, { ...context, ...meta }),
      warn: (message: string, meta: Record<string, any> = {}) => this.warn(message, { ...context, ...meta }),
      info: (message: string, meta: Record<string, any> = {}) => this.info(message, { ...context, ...meta }),
      debug: (message: string, meta: Record<string, any> = {}) => this.debug(message, { ...context, ...meta }),
      log: (level: string, message: string, meta: Record<string, any> = {}) => this.log(level, message, { ...context, ...meta }),
    };
  }
}

export const logger = new EdgeLogger();

/**
 * Generate a unique request ID
 * @returns A unique request ID string
 */
export function generateRequestId(): string {
  return uuidv4();
}

/**
 * Create a child logger with request context
 * @param context - Request context information
 * @returns A child logger with context
 */
export function createRequestLogger(context: RequestContext) {
  return logger.child(context);
}

/**
 * Log security events with appropriate level and context
 * @param event - Security event type
 * @param message - Event message
 * @param context - Additional context
 */
export function logSecurityEvent(
  event: "auth_success" | "auth_failure" | "rate_limit" | "unauthorized_access" | "token_refresh",
  message: string,
  context: Record<string, any> = {}
) {
  const level = event === "auth_failure" || event === "unauthorized_access" ? "warn" : "info";
  
  logger.log(level, message, {
    securityEvent: event,
    ...context,
  });
}

/**
 * Log API requests with timing and response information
 * @param context - Request context
 * @param duration - Request duration in milliseconds
 * @param statusCode - HTTP status code
 * @param error - Error if request failed
 */
export function logApiRequest(
  context: RequestContext,
  duration: number,
  statusCode: number,
  error?: Error
) {
  const level = statusCode >= 400 ? "warn" : "info";
  const message = `${context.method} ${context.url} - ${statusCode} (${duration}ms)`;
  
  const logData = {
    ...context,
    duration,
    statusCode,
    error: error ? {
      message: error.message,
      stack: error.stack,
    } : undefined,
  };
  
  logger.log(level, message, logData);
}

/**
 * Sanitize sensitive data from logs
 * @param data - Data to sanitize
 * @returns Sanitized data with sensitive fields removed
 */
export function sanitizeLogData(data: Record<string, any>): Record<string, any> {
  const sensitiveFields = [
    "password",
    "token",
    "accessToken",
    "refreshToken",
    "secret",
    "key",
    "authorization",
    "cookie",
  ];
  
  const sanitized = { ...data };
  
  function sanitizeObject(obj: any, path = ""): any {
    if (typeof obj !== "object" || obj === null) {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map((item, index) => sanitizeObject(item, `${path}[${index}]`));
    }
    
    const result: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const fullPath = path ? `${path}.${key}` : key;
      
      if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        result[key] = "[REDACTED]";
      } else {
        result[key] = sanitizeObject(value, fullPath);
      }
    }
    
    return result;
  }
  
  return sanitizeObject(sanitized);
}