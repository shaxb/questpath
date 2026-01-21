'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Sparkles, Loader2, Target } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navbar from '@/components/Navbar';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import PremiumLimitModal from '@/components/PremiumLimitModal';

// Example goals users can click to try
const EXAMPLE_GOALS = [
  "🌐 Learn web development",
  "🐍 Master Python",
  "🎨 UI/UX design",
  "🤖 Machine learning",
  "📱 Mobile app dev",
  "⚡ Master TypeScript",
];

export default function NewGoalPage() {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumModalMessage, setPremiumModalMessage] = useState('');
  const [isPremiumExpired, setIsPremiumExpired] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      setError('What do you want to learn?');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/goals', {
        description: description.trim()
      });

      router.push(`/goals/${response.data.id}`);
    } catch (err: any) {
      // Handle different error formats
      let errorMessage = 'Failed to create goal. Please try again.';
      
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        
        // If detail is an object with structured error info
        if (typeof detail === 'object' && !Array.isArray(detail)) {
          errorMessage = detail.message || errorMessage;
          
          // Handle premium/limit errors with modal
          if (detail.code === 'GOAL_LIMIT_REACHED') {
            setPremiumModalMessage(detail.message);
            setIsPremiumExpired(false);
            setShowPremiumModal(true);
            setLoading(false);
            return;
          }
          
          if (detail.code === 'PREMIUM_EXPIRED') {
            setPremiumModalMessage(detail.message);
            setIsPremiumExpired(true);
            setShowPremiumModal(true);
            setLoading(false);
            return;
          }
          
          // Handle AI service errors
          if (detail.code === 'AI_SERVICE_ERROR') {
            errorMessage = detail.message;
          }
          
          // Handle invalid AI response errors
          if (detail.code === 'INVALID_AI_RESPONSE') {
            errorMessage = detail.message;
          }
        }
        // If detail is a string, use it directly
        else if (typeof detail === 'string') {
          errorMessage = detail;
        }
        // If detail is an array (validation errors), extract the message
        else if (Array.isArray(detail)) {
          errorMessage = detail[0]?.msg || errorMessage;
        }
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  const selectExample = (example: string) => {
    setDescription(example.substring(2).trim()); // Remove emoji
    setError('');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <Navbar />

      {/* Premium Limit Modal */}
      <PremiumLimitModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        message={premiumModalMessage}
        title={isPremiumExpired ? "Premium Expired" : "Upgrade to Premium"}
        isPremiumExpired={isPremiumExpired}
      />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-2xl mb-4 shadow-lg">
            <Target className="text-purple-600 dark:text-purple-400" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 animate-slide-up">Create New Goal</h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg animate-slide-up animation-delay-100">Tell us what you want to learn, and we'll create your personalized roadmap</p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8 animate-slide-up animation-delay-200 hover:shadow-md transition-shadow duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Input */}
            <div>
              <label htmlFor="goal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Learning Goal
              </label>
              <input
                id="goal"
                type="text"
                value={description}
                onChange={(e) => setDescription(String(e.target.value))}
                placeholder="e.g., Learn web development"
                disabled={loading}
                className="w-full px-4 py-3 text-gray-900 dark:text-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 outline-none transition-all duration-200 disabled:bg-gray-100 dark:disabled:bg-slate-700 disabled:cursor-not-allowed focus:scale-[1.01] transform placeholder-gray-400 dark:placeholder-gray-500"
              />
              
              {error && (
                <div className="mt-3">
                  <ErrorDisplay
                    message={error}
                    onRetry={() => setError('')}
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !description.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transform shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Creating your roadmap...
                </>
              ) : (
                <>
                  <Sparkles className="animate-pulse" size={20} />
                  Generate AI Roadmap
                </>
              )}
            </button>
          </form>
        </div>

        {/* Example Suggestions */}
        <div className="animate-slide-up animation-delay-300">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Or try one of these popular goals:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {EXAMPLE_GOALS.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => selectExample(example)}
                disabled={loading}
                style={{ animationDelay: `${index * 50}ms` }}
                className="px-4 py-3 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 text-left hover:scale-105 transform animate-slide-up hover:shadow-md"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
