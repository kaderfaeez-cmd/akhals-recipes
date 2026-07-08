import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { hasDatabase, prisma } from "@/lib/prisma";

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
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

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
