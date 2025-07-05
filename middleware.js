import { NextResponse } from "next/server";

export function middleware(request) {
  // Allow only /login and static files for unauthenticated users
  const isAuth = request.cookies.get("auth")?.value || (typeof window !== "undefined" && localStorage.getItem("auth"));
  const { pathname } = request.nextUrl;
  if (!isAuth && pathname !== "/login" && !pathname.startsWith("/api") && !pathname.startsWith("/_next") && !pathname.startsWith("/favicon")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  // If logged in and on /login, redirect to /home
  if (isAuth && pathname === "/login") {
    return NextResponse.redirect(new URL("/home", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|logo|public).*)"],
};
