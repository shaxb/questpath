'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { signIn } from 'next-auth/react';
import { useUser } from '@/contexts/UserContext';

function LoginForm() {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Navigation
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useUser();

  // Check if user just registered (from URL query param)
  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccessMessage('Account created! Please log in.');
    }
  }, [searchParams]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // IMPORTANT: Backend expects OAuth2 form data format
      // Not JSON! We need to send as application/x-www-form-urlencoded
      const formData = new URLSearchParams();
      formData.append('username', email);  // OAuth2 calls it 'username'
      formData.append('password', password);
      
      // Call login endpoint
      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      // Extract token from response
      const { access_token } = response.data;
      
      // Store token in browser's localStorage
      localStorage.setItem('token', access_token);
      
      // Refresh UserContext to load the user data
      await refreshUser();
      
      // Success! Redirect to dashboard
      router.push('/dashboard');
      
    } catch (err: any) {
      // Handle different error types
      if (err.response?.status === 401) {
        setError('Invalid email or password');
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Redirect to NextAuth Google OAuth - redirect: true means it won't return
      await signIn('google', { 
        callbackUrl: '/auth/google/callback',
        redirect: true 
      });
      // Code after signIn won't execute because redirect: true redirects immediately
    } catch (err: any) {
      console.error('Google login error:', err);
      setError('Google login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Animation Area (70%) */}
      <div className="hidden lg:flex lg:w-[70%] bg-gradient-to-br from-green-400 via-blue-500 to-purple-500 relative overflow-hidden">
        {/* Floating Icons */}
        <div className="absolute inset-0">
          {/* Book Icon 1 */}
          <div className="absolute top-[10%] left-[15%] animate-float" style={{ animationDelay: '0s' }}>
            <div className="text-6xl transform hover:scale-110 transition-transform">📚</div>
          </div>
          
          {/* Trophy Icon */}
          <div className="absolute top-[25%] right-[20%] animate-float-slow" style={{ animationDelay: '1s' }}>
            <div className="text-7xl transform hover:scale-110 transition-transform">🏆</div>
          </div>
          
          {/* Star Icon 1 */}
          <div className="absolute top-[60%] left-[25%] animate-float" style={{ animationDelay: '2s' }}>
            <div className="text-5xl transform hover:scale-110 transition-transform">⭐</div>
          </div>
          
          {/* Book Icon 2 */}
          <div className="absolute bottom-[20%] right-[15%] animate-float-slow" style={{ animationDelay: '0.5s' }}>
            <div className="text-6xl transform hover:scale-110 transition-transform">📖</div>
          </div>
          
          {/* Star Icon 2 */}
          <div className="absolute top-[45%] right-[35%] animate-float" style={{ animationDelay: '1.5s' }}>
            <div className="text-4xl transform hover:scale-110 transition-transform">✨</div>
          </div>
          
          {/* Brain Icon */}
          <div className="absolute bottom-[35%] left-[35%] animate-float-slow" style={{ animationDelay: '2.5s' }}>
            <div className="text-6xl transform hover:scale-110 transition-transform">🧠</div>
          </div>
          
          {/* Target Icon */}
          <div className="absolute top-[35%] left-[10%] animate-float" style={{ animationDelay: '3s' }}>
            <div className="text-5xl transform hover:scale-110 transition-transform">🎯</div>
          </div>
          
          {/* Rocket Icon */}
          <div className="absolute bottom-[45%] right-[25%] animate-float-slow" style={{ animationDelay: '1.8s' }}>
            <div className="text-6xl transform hover:scale-110 transition-transform">🚀</div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="w-full h-full flex items-center justify-center relative z-10">
          <div className="text-center text-white">
            <h1 className="text-6xl font-bold mb-4">👋</h1>
            <h2 className="text-4xl font-bold mb-2">Welcome Back!</h2>
            <p className="text-xl opacity-90">Continue where you left off</p>
          </div>
        </div>
        
        {/* Decorative circles */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-yellow-400/20 rounded-full blur-xl"></div>
      </div>

      {/* Right Side - Login Form (30%) */}
      <div className="w-full lg:w-[30%] bg-white dark:bg-slate-900 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-green-500 dark:text-green-400 mb-2">QuestPath</h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Sign in to your account</p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Success message (from registration) */}
            {successMessage && (
              <div className="bg-green-50 border-2 border-green-400 text-green-700 dark:bg-green-900/40 dark:border-green-600 dark:text-green-200 px-4 py-3 rounded-xl text-sm">
                {successMessage}
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-400 text-red-700 dark:bg-red-900/40 dark:border-red-600 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Email input */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                EMAIL
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:border-green-500 transition-colors text-gray-900 dark:text-gray-100 dark:bg-slate-800 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="you@example.com"
              />
            </div>

            {/* Password input */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                PASSWORD
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:border-green-500 transition-colors text-gray-900 dark:text-gray-100 dark:bg-slate-800 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Your password"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white dark:bg-slate-900 text-gray-500 dark:text-gray-400 font-bold">OR</span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 px-4 border-2 border-gray-300 rounded-xl font-bold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              SIGN IN WITH GOOGLE
            </button>

            {/* Link to register */}
            <div className="text-center text-sm pt-4">
              <span className="text-gray-600 dark:text-gray-300">Don't have an account? </span>
              <Link href="/register" className="font-bold text-blue-500 hover:text-blue-600">
                Create one
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-red-500">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
