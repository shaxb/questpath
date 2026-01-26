import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'standalone',  // Enable standalone mode for Docker

  rewrites: async () => {
    const isDev = process.env.NODE_ENV === 'development'

    // In development, proxy backend API to localhost:8000
    if (isDev) {
      return [
        // Backend endpoints FIRST (before NextAuth catches them)
        { source: '/api/auth/register', destination: 'http://localhost:8000/auth/register' },
        { source: '/api/auth/me', destination: 'http://localhost:8000/auth/me' },
        { source: '/api/auth/login', destination: 'http://localhost:8000/auth/login' },
        { source: '/api/auth/refresh', destination: 'http://localhost:8000/auth/refresh' },
        { source: '/api/auth/oauth-login', destination: 'http://localhost:8000/auth/oauth-login' },
        
        // Backend API routes (goals, leaderboard, etc.)
        { source: '/api/goals/:path*', destination: 'http://localhost:8000/goals/:path*' },
        { source: '/api/leaderboard/:path*', destination: 'http://localhost:8000/leaderboard/:path*' },
        { source: '/api/progression/:path*', destination: 'http://localhost:8000/progression/:path*' },
        { source: '/api/payment/:path*', destination: 'http://localhost:8000/payment/:path*' },
        { source: '/api/admin/:path*', destination: 'http://localhost:8000/admin/:path*' },
        { source: '/api/health', destination: 'http://localhost:8000/health' },

        // Keep NextAuth client-side endpoints local (AFTER backend routes)
        { source: '/api/auth/session', destination: '/api/auth/session' },
        { source: '/api/auth/csrf', destination: '/api/auth/csrf' },
        { source: '/api/auth/signin/:provider*', destination: '/api/auth/signin/:provider*' },
        { source: '/api/auth/signin', destination: '/api/auth/signin' },
        { source: '/api/auth/signout', destination: '/api/auth/signout' },
        { source: '/api/auth/providers', destination: '/api/auth/providers' },
        { source: '/api/auth/callback/:path*', destination: '/api/auth/callback/:path*' },
      ]
    }

    // Production: keep /api routes as-is (nginx handles proxying)
    return []
  }
};

export default nextConfig;
