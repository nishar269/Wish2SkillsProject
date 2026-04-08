export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    // Match all dashboard routes
    "/student/:path*",
    "/faculty/:path*",
    "/admin/:path*",
    "/coordinator/:path*",
    "/records/:path*",
    "/authority/:path*",
    // Match API routes except auth
    "/api/((?!auth).*)",
  ],
};
