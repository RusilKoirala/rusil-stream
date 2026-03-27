import { NextResponse } from "next/server";

export const runtime = "edge";

function decodeJWT(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Public routes
  const publicPaths = [
    "/",
    "/login",
    "/verify-email",
    "/dev-tools",
    "/api/auth/signup",
    "/api/auth/send-verification",
    "/api/auth/verify-email",
    "/api/auth/me",
    "/api/login",
    "/api/auth/logout",
    "/api/admin/pending-verifications",
    "/manifest.json",
  ];

  if (
    publicPaths.includes(pathname) ||
    pathname === "" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/logo") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/download") ||
    pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|css|js|webp|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next();
  }

  // Check authentication
  const token = request.cookies.get("rusil_session")?.value;
  const user = token ? decodeJWT(token) : null;

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

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon|logo|public|.*\\.(?:jpg|jpeg|png|gif|svg|ico|css|js)$).*)",
  ],
};
