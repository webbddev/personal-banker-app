import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Routes that require a valid Clerk session (UI access)
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/investments(.*)',
  '/api((?!/notifications).*)', // Protect all /api except notifications
]);

// Routes designed for external automation (n8n, scripts, etc.)
const isPublicApiRoute = createRouteMatcher([
  '/api/v1/investments(.*)',
  '/api/notifications(.*)',
]);

/**
 * CURRENT STATE: API access for notifications and n8n is ENABLED.
 * Notification routes (/api/notifications/*) bypass Clerk
 * and rely on the custom 'x-api-key' or 'Authorization: Bearer <CRON_SECRET>'
 * validation inside their respective route.ts files.
 */
export default clerkMiddleware(async (auth, req) => {
  if (isPublicApiRoute(req)) return;
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
