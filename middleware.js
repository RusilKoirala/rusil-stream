import { NextResponse } from "next/server";
import { verifyToken } from "./lib/auth";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Public routes
  const publicPaths = [
    "/",
    "/login",
    "/api/auth/signup",
    "/api/login",
    "/api/auth/logout"
  ];
  
  if (
    publicPaths.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/logo") ||
    pathname.startsWith("/public") ||
    pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // Check authentication
  const token = request.cookies.get("rusil_session")?.value;
  const user = token ? verifyToken(token) : null;

  if (!user) {
    // Redirect to login if not authenticated
    if (pathname !== "/login") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } else {
    // Redirect to profiles if authenticated and trying to access login
    if (pathname === "/login") {
      return NextResponse.redirect(new URL("/profiles", request.url));
    }
  }

  return NextResponse.next();
}
