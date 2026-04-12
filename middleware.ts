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
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
