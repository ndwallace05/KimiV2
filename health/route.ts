import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logging";

/**
 * Health check endpoint
 * GET /api/health
 */
export async function GET(request: NextRequest) {
  try {
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || "unknown",
      uptime: process.uptime(),
    };

    logger.info("Health check requested", {
      requestId: request.headers.get("X-Request-ID"),
      ip: request.headers.get("x-forwarded-for") || request.ip,
    });

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    logger.error("Health check failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      requestId: request.headers.get("X-Request-ID"),
    });

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}