import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { Role } from "@/lib/permissions";
import { loginSchema } from "@/lib/validations";
import { authConfig } from "./auth.config";

type VerifiedUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  image: string | null;
};

export async function verifyCredentials(
  email: string,
  password: string,
  options?: { updateLastLogin?: boolean }
): Promise<VerifiedUser | null> {
  const parsed = loginSchema.safeParse({ email, password });

  if (!parsed.success) {
    return null;
  }

  const { db } = await import("@/lib/db");
  const user = await db.user.findUnique({
    where: { email: parsed.data.email.toLowerCase(), deletedAt: null },
  });

  if (!user || user.status !== "ACTIVE") {
    return null;
  }

  const isValidPassword = await bcrypt.compare(parsed.data.password, user.passwordHash);

  if (!isValidPassword) {
    return null;
  }

  if (options?.updateLastLogin) {
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
  }

  return {
    id: user.id,
    name: user.name ?? user.email,
    email: user.email,
    role: user.role as Role,
    image: user.avatarUrl,
  };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-build-only",
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        return verifyCredentials(String(credentials.email), String(credentials.password), {
          updateLastLogin: true,
        });
      },
    }),
  ],
});
