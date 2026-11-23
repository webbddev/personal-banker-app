import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * RFC 9728 OAuth 2.0 Protected Resource Metadata
 *
 * Catches:
 * - GET /.well-known/oauth-protected-resource
 * - GET /.well-known/oauth-protected-resource/api/mcp
 * - GET /.well-known/oauth-protected-resource/*
 */
export async function GET() {
  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL || 'https://personal-banker-niko.vercel.app'
  ).replace(/\/$/, '');

  const clerkIssuer = (
    process.env.CLERK_ISSUER_URL || 'https://first-asp-75.clerk.accounts.dev'
  ).replace(/\/$/, '');

  const metadata = {
    resource: `${appUrl}/api/mcp`,
    authorization_servers: [clerkIssuer],
    bearer_methods_supported: ['header'],
    scopes_supported: ['profile', 'email'],
  };

  return NextResponse.json(metadata, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
