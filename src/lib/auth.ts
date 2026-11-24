import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { hasDatabase, prisma } from "@/lib/prisma";
import { LOGIN_RATE_LIMIT, checkRateLimit, clientIp, rateLimitKey } from "@/lib/rate-limit";
import { TOO_MANY_ATTEMPTS } from "@/lib/auth-errors";

/**
 * Per-IP login limit (LOGIN_RATE_LIMIT), counted before the password is checked. Fails closed: if
 * the limiter cannot be reached, the attempt is refused rather than allowed unthrottled.
 */
async function loginAllowed(headers: Record<string, unknown> | undefined): Promise<boolean> {
  const header = (name: string) => {
    const value = headers?.[name];
    return typeof value === "string" ? value : undefined;
  };
  const result = await checkRateLimit(rateLimitKey("login", clientIp(header)), LOGIN_RATE_LIMIT);
  return result.allowed;
}

// Credentials auth against the User table. When no database is configured,
// a bootstrap admin from env vars keeps the panel reachable in development.
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials.password) return null;

        let allowed: boolean;
        try {
          allowed = await loginAllowed(req?.headers);
        } catch (err) {
          console.error("[auth] rate limit check failed, refusing login:", err);
          return null;
        }
        // Thrown errors reach the login page as `error`; it shows a "try again later" message.
        if (!allowed) throw new Error(TOO_MANY_ATTEMPTS);

        if (hasDatabase()) {
          try {
            const user = await prisma.user.findUnique({
              where: { email: credentials.email.toLowerCase() },
            });
            if (!user) return null;
            const ok = await bcrypt.compare(credentials.password, user.passwordHash);
            if (!ok) return null;
            return { id: user.id, email: user.email, name: user.name ?? "Admin" };
          } catch (err) {
            console.error("[auth] DB lookup failed:", err);
            return null;
          }
        }

        // Dev bootstrap (no DB yet): ADMIN_EMAIL + ADMIN_PASSWORD env pair.
        const bootEmail = process.env.ADMIN_EMAIL;
        const bootPassword = process.env.ADMIN_PASSWORD;
        if (
          bootEmail &&
          bootPassword &&
          credentials.email.toLowerCase() === bootEmail.toLowerCase() &&
          credentials.password === bootPassword
        ) {
          return { id: "bootstrap-admin", email: bootEmail, name: "Admin" };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.uid = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.uid) {
        (session.user as { id?: string }).id = token.uid as string;
      }
      return session;
    },
  },
};
