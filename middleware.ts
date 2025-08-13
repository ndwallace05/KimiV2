import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { getToken } from "next-auth/jwt";

// Rate limiter configuration
const rateLimiter = new RateLimiterMemory({
  points: parseInt(process.env.RATE_LIMIT_POINTS || "10"), // Number of requests
  duration: parseInt(process.env.RATE_LIMIT_DURATION || "60"), // Per 60 seconds
});

// Rate limiter for authenticated users (higher limits)
const authenticatedRateLimiter = new RateLimiterMemory({
  points: parseInt(process.env.RATE_LIMIT_POINTS_AUTH || "50"), // Higher limit for authenticated users
  duration: parseInt(process.env.RATE_LIMIT_DURATION || "60"),
});

/**
 * Get client IP address from request
 * @param request - Next.js request object
 * @returns Client IP address
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return request.ip || "unknown";
}

/**
 * Apply security headers to response
 * @param response - Next.js response object
 * @returns Response with security headers
 */
function applySecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy - relaxed for development
  const cspPolicy = process.env.NODE_ENV === 'development' 
    ? "default-src 'self'; " +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https: blob:; " +
      "connect-src 'self' https://api.openai.com https://accounts.google.com https://www.googleapis.com; " +
      "frame-src 'self' https://accounts.google.com;"
    : "default-src 'self'; " +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https: blob:; " +
      "connect-src 'self' https://api.openai.com https://accounts.google.com https://www.googleapis.com; " +
      "frame-src 'self' https://accounts.google.com; " +
      "trusted-types default; " +
      "require-trusted-types-for 'script';";
  
  response.headers.set("Content-Security-Policy", cspPolicy);
  
  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");
  
  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");
  
  // Referrer policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // Strict Transport Security (HTTPS only)
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }
  
  // Permissions Policy
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );
  
  return response;
}

/**
 * Check if request should be rate limited
 * @param request - Next.js request object
 * @param token - NextAuth JWT token
 * @returns Promise resolving to true if rate limited
 */
async function checkRateLimit(request: NextRequest, token: any): Promise<boolean> {
  const clientIP = getClientIP(request);
  const userId = token?.userId;
  
  // Use different rate limiters for authenticated vs unauthenticated users
  const limiter = userId ? authenticatedRateLimiter : rateLimiter;
  const key = userId ? `user:${userId}` : `ip:${clientIP}`;
  
  try {
    await limiter.consume(key);
    return false; // Not rate limited
  } catch (rateLimiterRes) {
    // Log rate limit event
    console.warn("Rate limit exceeded", {
      clientIP,
      userId,
      key,
      remainingPoints: rateLimiterRes.remainingPoints || 0,
      msBeforeNext: rateLimiterRes.msBeforeNext || 0,
    });
    
    return true; // Rate limited
  }
}

/**
 * Main middleware function
 * @param request - Next.js request object
 * @returns Next.js response
 */
export async function middleware(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const clientIP = getClientIP(request);
  
  // Create response
  let response = NextResponse.next();
  
  // Add request ID to response headers for tracing
  response.headers.set("X-Request-ID", requestId);
  
  try {
    // Get authentication token
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    // Check authentication for protected routes
    if (request.nextUrl.pathname.startsWith("/api/")) {
      // Skip auth check for NextAuth routes and public endpoints
      const publicPaths = [
        "/api/auth",
        "/api/health",
      ];
      
      const isPublicPath = publicPaths.some(path => 
        request.nextUrl.pathname.startsWith(path)
      );
      
      if (!isPublicPath && !token) {
        console.warn("Unauthorized API access attempt", {
          ip: clientIP,
          path: request.nextUrl.pathname,
        });
        
        return new NextResponse(
          JSON.stringify({ error: "Unauthorized" }), 
          { 
            status: 401,
            headers: {
              "Content-Type": "application/json",
              "X-Request-ID": requestId,
            },
          }
        );
      }
      
      // Skip rate limiting for OAuth callback routes to prevent interference with authentication flow
      const skipRateLimitPaths = [
        "/api/auth/callback",
        "/api/auth/signin",
        "/api/auth/signout",
        "/api/auth/session",
      ];
      
      const shouldSkipRateLimit = skipRateLimitPaths.some(path => 
        request.nextUrl.pathname.startsWith(path)
      );
      
      // Apply rate limiting to API routes (except OAuth routes)
      if (!shouldSkipRateLimit) {
        const isRateLimited = await checkRateLimit(request, token);
        if (isRateLimited) {
          return new NextResponse(
            JSON.stringify({ 
              error: "Too many requests", 
              message: "Rate limit exceeded. Please try again later." 
            }), 
            { 
              status: 429,
              headers: {
                "Content-Type": "application/json",
                "X-Request-ID": requestId,
                "Retry-After": "60",
              },
            }
          );
        }
      }
    }
    
    // Apply security headers
    response = applySecurityHeaders(response);
    
    return response;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    console.error("Middleware error", {
      requestId,
      ip: clientIP,
      error: errorMessage,
    });
    
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }), 
      { 
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "X-Request-ID": requestId,
        },
      }
    );
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // Match all API routes
    "/api/:path*",
    // Match all app routes except static files
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|logo.svg).*)",
  ],
};