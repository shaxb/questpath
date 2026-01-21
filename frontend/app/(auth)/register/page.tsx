'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { signIn } from "next-auth/react";


export default function RegisterPage() {
  // State for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // State for UI feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Router for navigation after success
  const router = useRouter();

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    const checks = {
      length: pwd.length >= 6,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };

    if (checks.length) strength++;
    if (checks.uppercase) strength++;
    if (checks.lowercase) strength++;
    if (checks.number) strength++;
    if (checks.special) strength++;

    return { strength, checks };
  };

  const passwordAnalysis = getPasswordStrength(password);
  const strengthStars = passwordAnalysis.strength;

  // Get missing requirements text
  const getMissingRequirements = () => {
    if (!password) return '';
    const missing = [];
    if (!passwordAnalysis.checks.length) missing.push('at least 6 characters');
    if (!passwordAnalysis.checks.uppercase) missing.push('an uppercase letter');
    if (!passwordAnalysis.checks.lowercase) missing.push('a lowercase letter');
    if (!passwordAnalysis.checks.number) missing.push('a number');
    if (!passwordAnalysis.checks.special) missing.push('a special character');
    
    if (missing.length === 0) return '✓ Strong password!';
    if (missing.length === 5) return 'Start typing to see strength';
    return `Add ${missing.join(', ')}`;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();  // Prevent page reload
    
    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Step 1: Register the user
      await api.post('/auth/register', {
        email,
        password
      });
      
      // Step 2: Automatically log in the user
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      
      const loginResponse = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      // Step 3: Store the token
      localStorage.setItem('token', loginResponse.data.access_token);
      
      // Step 4: Redirect to dashboard (user is now logged in!)
      router.push('/dashboard');
      
    } catch (err: any) {
      // Handle errors
      const errorMessage = err.response?.data?.detail || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signIn("google", {
        callbackUrl: '/auth/google/callback',
        redirect: true
      });
    } catch (err) {
      setError('Google registration failed. Please try again.');
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex">
      {/* Left Side - Animation Area (70%) */}
      <div className="hidden lg:flex lg:w-[70%] bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 dark:from-purple-700 dark:via-blue-700 dark:to-cyan-600 relative overflow-hidden">
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
            <h1 className="text-6xl font-bold mb-4">🚀</h1>
            <h2 className="text-4xl font-bold mb-2">Start Your Learning Adventure</h2>
            <p className="text-xl opacity-90">Level up your skills with QuestPath</p>
          </div>
        </div>
        
        {/* Decorative circles */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-yellow-400/20 rounded-full blur-xl"></div>
      </div>

      {/* Right Side - Register Form (30%) */}
      <div className="w-full lg:w-[30%] bg-white dark:bg-slate-900 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">QuestPath</h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Create your free account</p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
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
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                  PASSWORD
                </label>
                {/* Password strength stars */}
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 transition-all duration-300 ${
                        star <= strengthStars ? 'animate-pulse' : ''
                      }`}
                      viewBox="0 0 24 24"
                      fill={star <= strengthStars ? '#FFD700' : 'none'}
                      stroke={star <= strengthStars ? '#FFD700' : '#D1D5DB'}
                      strokeWidth="2"
                      style={{
                        filter: star <= strengthStars ? 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))' : 'none',
                      }}
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:border-green-500 transition-colors text-gray-900 dark:text-gray-100 dark:bg-slate-800 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="At least 6 characters"
              />
              {/* Password requirements hint */}
              {password && (
                <p className={`text-xs mt-2 transition-colors ${
                  strengthStars === 5 ? 'text-green-600 font-bold' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {getMissingRequirements()}
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
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

            {/* Google Sign Up Button */}
            <button
              type="button"
              onClick={handleGoogleRegister}
              disabled={loading}
              className="w-full py-3 px-4 border-2 border-gray-300 rounded-xl font-bold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              SIGN UP WITH GOOGLE
            </button>

            {/* Link to login */}
            <div className="text-center text-sm pt-4">
              <span className="text-gray-600 dark:text-gray-300">Already have an account? </span>
              <Link href="/login" className="font-bold text-blue-500 hover:text-blue-600">
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
