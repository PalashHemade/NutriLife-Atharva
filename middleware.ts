import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;

    // RBAC logic
    if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
      return NextResponse.rewrite(new URL("/unauthorized", req.url));
    }
    if (pathname.startsWith("/dashboard/consultant") && role !== "consultant" && role !== "admin") {
      return NextResponse.rewrite(new URL("/unauthorized", req.url));
    }
    if (pathname.startsWith("/dashboard/trainer") && role !== "trainer" && role !== "admin") {
      return NextResponse.rewrite(new URL("/unauthorized", req.url));
    }
    if (pathname.startsWith("/dashboard/user") && role !== "user" && role !== "admin") {
      return NextResponse.rewrite(new URL("/unauthorized", req.url));
    }
  },
  {
    callbacks: {
      // Deny access once the refresh token has expired/been revoked and the
      // access token could not be renewed (jwt callback sets token.error).
      authorized: ({ token }) => !!token && !token.error,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
