import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Routes that require a valid Clerk session (UI access)
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/investments(.*)',
  '/api(.*)',
]);

// Routes designed for external automation (n8n, scripts, etc.)
const isPublicApiRoute = createRouteMatcher(['/api/v1/investments(.*)']);

/**
 * CURRENT STATE: API access for n8n is DISABLED.
 * The middleware below follows standard Clerk protection.
 * Since /api/v1/investments contains the word "investments",
 * it currently falls under 'isProtectedRoute' and requires a login session.
 */
export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

/**
 * FUTURE STATE: To enable n8n / external API access:
 * 1. Comment out the 'export default' block above.
 * 2. Uncomment the block below.
 * * This allows 'isPublicApiRoute' to skip Clerk authentication
 * and rely on the custom 'x-api-key' validation inside route.ts.
 */
// export default clerkMiddleware(async (auth, req) => {
//   if (isPublicApiRoute(req)) {
//     return; // Bypass Clerk for API calls
//   }
//   if (isProtectedRoute(req)) await auth.protect();
// });

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
