import { NextAuthConfig } from "next-auth";
import { Role } from "@/lib/permissions";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        console.log('AUTH_JWT: Token initialized for', user.email, 'with role', (user as any).role);
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        console.log('AUTH_SESSION: Session ready for', session.user.email, 'with role', (session.user as any).role);
      }
      return session;
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
