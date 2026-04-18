import type { NextAuthConfig, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { Role } from "@/lib/permissions";

type AppToken = JWT & {
  id?: string;
  role?: Role;
};

type AppSession = Session & {
  user: NonNullable<Session["user"]> & {
    id: string;
    role?: Role;
  };
};

function isRole(value: unknown): value is Role {
  return typeof value === "string" && Object.values(Role).includes(value as Role);
}

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      const appToken = token as AppToken;

      if (user) {
        appToken.id = user.id;

        const role = "role" in (user as User) ? (user as User & { role?: unknown }).role : undefined;
        if (isRole(role)) {
          appToken.role = role;
        }
      }
      return appToken;
    },
    async session({ session, token }) {
      const appToken = token as AppToken;
      const appSession = session as AppSession;

      if (appSession.user) {
        if (typeof appToken.id === "string") {
          appSession.user.id = appToken.id;
        }
        if (isRole(appToken.role)) {
          appSession.user.role = appToken.role;
        }
      }
      return appSession;
    },
    async authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      // Public routes that don't need auth
      const publicPaths = ["/", "/about", "/courses", "/services", "/contact", "/apply", "/login", "/api/seed"];
      const isPublicPath = publicPaths.some(
        (path) => pathname === path || pathname.startsWith("/api/auth")
      );

      if (isPublicPath) return true;

      // Dashboard routes need auth
      if (!isLoggedIn) return false;

      return true;
    },
  },
  providers: [], // Providers are added in auth.ts to avoid Edge runtime issues with DB
} satisfies NextAuthConfig;
