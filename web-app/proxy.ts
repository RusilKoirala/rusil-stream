import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public web routes that do not require authentication.
const isPublicRoute = createRouteMatcher([
  '/',
  '/download(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/help(.*)',
  '/faq(.*)',
  '/feedback(.*)',
  '/contact-support(.*)',
]);
const isApiRoute = createRouteMatcher(['/api(.*)']);

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
const secretKey = process.env.CLERK_SECRET_KEY || '';

const hasClerkConfig =
  Boolean(publishableKey) &&
  Boolean(secretKey) &&
  !publishableKey.includes('your_publishable_key') &&
  !secretKey.includes('your_secret_key');

// Mobile UA detection — redirect mobile visitors to the download page
const MOBILE_UA_RE = /android|iphone|ipad|ipod|mobile|blackberry|windows phone/i;

function shouldRedirectMobile(request: NextRequest): boolean {
  const ua = request.headers.get('user-agent') ?? '';
  if (!MOBILE_UA_RE.test(ua)) return false;
  const { pathname } = request.nextUrl;
  // Allow download page, auth pages, and all API / static routes through
  return !pathname.startsWith('/download') &&
    !pathname.startsWith('/sign-in') &&
    !pathname.startsWith('/sign-up') &&
    !pathname.startsWith('/api/');
}

const middleware = hasClerkConfig
  ? clerkMiddleware(async (auth, request) => {
      if (shouldRedirectMobile(request)) {
        const url = request.nextUrl.clone();
        url.pathname = '/download';
        return NextResponse.redirect(url);
      }

      // Keep API auth checks in route handlers while still running middleware
      // so Clerk auth() can resolve session context on API requests.
      if (!isPublicRoute(request) && !isApiRoute(request)) {
        await auth.protect();
      }
    })
  : (request: NextRequest) => {
      if (shouldRedirectMobile(request)) {
        const url = request.nextUrl.clone();
        url.pathname = '/download';
        return NextResponse.redirect(url);
      }
      return NextResponse.next();
    };

export default middleware;

export const config = {
  matcher: [
    // Run proxy on app pages and API routes.
    // API routes perform authorization in their handlers.
    '/((?!trpc|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};