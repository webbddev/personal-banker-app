---
name: tavus-clerk-integration
description: "Integrates Tavus Conversational Video Interface (CVI) into a Next.js App Router project that uses Clerk authentication. Covers UI integration, proxy middleware fixes, and concurrency management."
---

# Tavus CVI + Clerk Integration Guide

This skill provides step-by-step instructions for safely integrating the Tavus Conversational Video Interface (CVI) React Component Library into a Next.js 15 (App Router) application that utilizes Clerk for authentication.

## 1. CLI Initialization
Always start by using the official Tavus CLI to scaffold the integration. Avoid writing raw API boilerplate from scratch.
1. Run `npx @tavus/cvi-ui@latest init` to initialize the library (`cvi-components.json`) and install core dependencies (`@daily-co/daily-react`, etc.).
2. Run `npx @tavus/cvi-ui@latest add conversation` to scaffold the React components into `app/components/cvi/`.
3. Run `npx @tavus/cvi-ui@latest add tavus-api` to create the server-side API route (`app/api/tavus/route.ts`) and client helpers (`tavus-client.ts`).

## 2. Setting Up the Provider
Wrap the required portion of the application (or the entire layout) with `<CVIProvider>` to provide the Daily video context. Ensure it is nested properly inside your main provider stack (e.g., inside `<ClerkProvider>` and `<SidebarProvider>`).
*Example (`app/layout.tsx`):*
```tsx
<ClerkProvider>
  <CVIProvider>
    {children}
  </CVIProvider>
</ClerkProvider>
```

## 3. Clerk Middleware Whitelisting (Crucial Fix)
By default, Clerk's `middleware.ts` (or `proxy.ts`) often protects the entire `/api/(.*)` route. 
When the Tavus UI client calls `/api/tavus` from a public page (or when the user is logged out), Clerk intercepts the request and issues a `307 Temporary Redirect` to `/sign-in`. The browser `fetch()` follows this, receives the HTML of the login page, and crashes with a JSON parsing error: `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`.

**Fix:** You MUST explicitly add `/api/tavus(.*)` to the `isPublicRoute` (or `isPublicApiRoute`) matcher in your Clerk middleware configuration so that the Tavus backend route is accessible to public/unauthenticated users (if the avatar is intended for public landing pages).

## 4. Concurrency Guarding & React Strict Mode
On developer tiers, Tavus enforces strict concurrency limits (e.g., only 1 active conversation at a time). React Strict Mode in Next.js development causes components to double-mount, and users may double-click the "Connect" button. This triggers multiple simultaneous calls to `/api/tavus`, resulting in a `400: User has reached maximum concurrent conversations` error.

**Fix:** 
1. Use a strict React `useRef` boolean flag in your modal to physically block subsequent `createTavusConversation()` calls if one is already in flight.
2. Disable the trigger button dynamically using the ref state and the presence of a returned conversation object.

## 5. UI & Aspect Ratio Considerations
The generated `<Conversation>` component uses CSS container queries (`@container`) and forces specific aspect ratios (e.g., `16/9` on desktop).
* Do not apply strict pixel or `vh` heights (e.g., `h-[85vh]`) to the dialog wrapper around the `Conversation` component. Doing so causes the wrapper to be taller than the 16:9 video, resulting in large empty background spaces below the avatar.
* Allow the modal container to implicitly size itself (shrink-wrap) around the `Conversation` component to maintain a clean layout.
