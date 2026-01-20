import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'standalone',  // Enable standalone mode for Docker

  rewrites: async () => {
    const isDev = process.env.NODE_ENV === 'development'

    // In development we want Next to handle NextAuth endpoints locally
    // and proxy backend API routes to http://localhost:8000 (strip the /api prefix).
    // In production we let nginx handle routing (keep /api as-is).
    if (isDev) {
      return [
        // Keep NextAuth client-side API endpoints local (no proxy)
        { source: '/api/auth/session', destination: '/api/auth/session' },
        { source: '/api/auth/csrf', destination: '/api/auth/csrf' },
        { source: '/api/auth/signin', destination: '/api/auth/signin' },
        { source: '/api/auth/signout', destination: '/api/auth/signout' },
        { source: '/api/auth/providers', destination: '/api/auth/providers' },
        { source: '/api/auth/callback/:path*', destination: '/api/auth/callback/:path*' },

        // Backend-owned auth endpoints -> proxy to backend and strip /api prefix
        { source: '/api/auth/register', destination: 'http://localhost:8000/auth/register' },
        { source: '/api/auth/me', destination: 'http://localhost:8000/auth/me' },

        // All other /api requests -> backend (strip /api/)
        { source: '/api/:path*', destination: 'http://localhost:8000/:path*' },
      ]
    }

    // Production: keep /api routes local to same origin (nginx will proxy)
    return [
      { source: '/api/:path*', destination: '/api/:path*' },
    ]
  }
};

export default nextConfig;
