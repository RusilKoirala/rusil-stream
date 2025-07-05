import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  if (
    pathname === "/login" ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/logo") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }
  const isAuth = request.cookies.get("rusil_auth")?.value;
  if (!isAuth) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}
