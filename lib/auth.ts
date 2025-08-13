import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "./db";
import { logger } from "./logging";

/**
 * Creates a user profile when a user signs in for the first time
 * @param user - The user object from NextAuth
 */
async function createUserProfile(user: any) {
  try {
    // Check if profile already exists to avoid unique constraint conflicts
    const existing = await db.userProfile.findUnique({ where: { userId: user.id } });
    if (existing) {
      return existing;
    }

    const displayName = user?.name || (user?.email ? String(user.email).split("@")[0] : "User");
    const profile = await db.userProfile.create({
      data: {
        userId: user.id,
        displayName,
        timezone: "UTC",
        // Prisma schema uses String columns; store JSON as strings
        workHours: JSON.stringify({}),
        preferences: JSON.stringify({}),
      },
    });
    logger.info("User profile created", { userId: user.id });
    return profile;
  } catch (error) {
    logger.error("Failed to create user profile", {
      userId: user.id,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope:
            process.env.GOOGLE_API_SCOPE ||
            "openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.readonly",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === "google") {
          logger.info("Google OAuth sign in attempt", {
            email: user.email,
            userId: user.id,
            accountId: account.providerAccountId,
          });

          // Ensure a profile exists for the user
          await createUserProfile(user);
          return true;
        }

        return true;
      } catch (error) {
        logger.error("Critical signIn error", {
          error: error instanceof Error ? error.message : "Unknown error",
          email: user?.email,
          userId: user?.id,
        });
        // Redirect to login with explicit error for better UX
        return "/login?error=ProfileCreationFailed";
      }
    },
    async jwt({ token, account, user }) {
      // Store access token in JWT for API calls
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }

      // Add user ID to token
      if (user) {
        token.userId = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.accessToken = token.accessToken as string;
        // @ts-ignore - extend default session user with id
        session.user.id = token.userId as string;
      }

      return session;
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      logger.info("User signed in", {
        userId: user.id,
        email: user.email,
        provider: account?.provider,
        isNewUser,
      });

      // Ensure user profile exists (defensive in case callback creation failed previously)
      try {
        await createUserProfile(user);
      } catch (e) {
        // Already logged inside createUserProfile; continue to not block sign-in
      }

      // Store integration tokens
      if (account && user.id) {
        try {
          const expiry = account.expires_at ? new Date(account.expires_at * 1000) : null;
          await db.integrationToken.upsert({
            where: {
              userId_provider: {
                userId: user.id,
                provider: account.provider,
              },
            },
            update: {
              accessToken: account.access_token || "",
              refreshToken: account.refresh_token || undefined,
              expiry: expiry,
            },
            create: {
              userId: user.id,
              provider: account.provider,
              accessToken: account.access_token || "",
              refreshToken: account.refresh_token || undefined,
              expiry: expiry,
            },
          });
          logger.info("Integration token stored", {
            userId: user.id,
            provider: account.provider,
          });
        } catch (error) {
          logger.error("Integration token storage failed", {
            userId: user.id,
            provider: account.provider,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
    },
    async signOut({ session, token }) {
      logger.info("User signed out", {
        userId: session?.user?.id || (token as any)?.userId,
      });
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Allow linking accounts with same email address
  // This fixes the OAuthAccountNotLinked error when a user exists but has no linked Google account
  allowDangerousEmailAccountLinking: true,
  debug: process.env.NODE_ENV === "development",
};