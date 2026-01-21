'use client';

import { useState, useEffect, Suspense } from 'react';
import { Crown, Sparkles, Zap, Target, CheckCircle2, Lock, Rocket } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Loading from '@/components/ui/Loading';
import { useUser } from '@/contexts/UserContext';
import api from '@/lib/api';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

function PricingContent() {
  const { user, loading: userLoading, refreshUser } = useUser();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const searchParams = useSearchParams();

  // Check for premium success query param and refresh user data
  useEffect(() => {
    const premiumStatus = searchParams.get('premium');
    if (premiumStatus === 'success') {
      // Refresh user data to get updated premium status
      refreshUser();
      // Don't show toast here - let dashboard handle it
    }
  }, []);  // Run only once on mount

  const handleUpgrade = async () => {
    setCheckoutLoading(true);
    try {
      const { data } = await api.post('/payment/checkout', { plan: 'premium' });
      
      const url = data?.url;
      if (!url) throw new Error(data?.error || 'No checkout URL returned');
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err: any) {
      // Error already shown by api toast
      console.error('Failed to start checkout:', err);
      setCheckoutLoading(false);
    }
  };

  if (userLoading) {
    return (
      <ProtectedRoute>
        <Loading fullPage message="Loading pricing..." />
      </ProtectedRoute>
    );
  }

  const isPremium = user?.is_premium || false;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <Navbar />

        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="text-yellow-500 dark:text-yellow-400" size={32} />
              <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100">
                Choose Your Plan
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Unlock your full learning potential with QuestPath
            </p>
          </div>

          {/* Premium Status Banner */}
          {isPremium && (
            <div className="mb-8 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
              <div className="flex items-center gap-3 justify-center">
                <Crown className="text-yellow-600 dark:text-yellow-400" size={24} fill="currentColor" />
                <p className="text-yellow-900 dark:text-yellow-200 font-semibold">
                  You're currently on the Premium plan!
                </p>
              </div>
            </div>
          )}

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Free Plan */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <Target className="text-gray-600 dark:text-gray-300" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Free</h2>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-gray-900 dark:text-gray-100">$0</span>
                    <span className="text-gray-600 dark:text-gray-300">/month</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Perfect for getting started with your learning journey
                  </p>
                </div>

                <div className="mb-6">
                  {!isPremium ? (
                    <div className="w-full py-3 px-6 rounded-lg bg-gray-100 dark:bg-gray-700 text-center text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-600">
                      Current Plan
                    </div>
                  ) : (
                    <div className="w-full py-3 px-6 rounded-lg bg-gray-100 dark:bg-gray-700 text-center text-gray-500 dark:text-gray-400 font-medium">
                      Previous Plan
                    </div>
                  )}
                </div>

                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" size={20} />
                    <span className="text-gray-700 dark:text-gray-300">Up to 2 active goals</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" size={20} />
                    <span className="text-gray-700 dark:text-gray-300">Basic roadmap generation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" size={20} />
                    <span className="text-gray-700 dark:text-gray-300">XP tracking and leveling</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" size={20} />
                    <span className="text-gray-700 dark:text-gray-300">Access to leaderboard</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Lock className="text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" size={20} />
                    <span className="text-gray-400 dark:text-gray-500 line-through">Unlimited goals</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Lock className="text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" size={20} />
                    <span className="text-gray-400 dark:text-gray-500 line-through">Priority AI processing</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 rounded-lg shadow-xl overflow-hidden relative">
              {/* Popular Badge */}
              <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1">
                <Sparkles size={12} />
                Popular
              </div>

              <div className="p-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Crown className="text-white" size={24} fill="currentColor" />
                  </div>
                  <h2 className="text-2xl font-bold">Premium</h2>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black">$5</span>
                    <span className="text-blue-100">/month</span>
                  </div>
                  <p className="text-blue-100 mt-2">
                    Unlimited learning power for serious achievers
                  </p>
                </div>

                <div className="mb-6">
                  {isPremium ? (
                    <div className="w-full py-3 px-6 rounded-lg bg-white/20 backdrop-blur-sm text-center text-white font-bold border-2 border-white/40">
                      Current Plan
                    </div>
                  ) : (
                    <button
                      onClick={handleUpgrade}
                      disabled={checkoutLoading}
                      className="w-full py-3 px-6 rounded-lg bg-white text-blue-600 font-bold hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {checkoutLoading ? (
                        <>
                          <Zap className="animate-pulse" size={20} />
                          Redirecting...
                        </>
                      ) : (
                        <>
                          <Rocket size={20} />
                          Upgrade Now
                        </>
                      )}
                    </button>
                  )}
                </div>

                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-white mt-0.5 flex-shrink-0" size={20} fill="currentColor" />
                    <span className="text-white font-medium">Unlimited goals and roadmaps</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-white mt-0.5 flex-shrink-0" size={20} fill="currentColor" />
                    <span className="text-white font-medium">Priority AI processing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-white mt-0.5 flex-shrink-0" size={20} fill="currentColor" />
                    <span className="text-white font-medium">Advanced analytics and insights</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-white mt-0.5 flex-shrink-0" size={20} fill="currentColor" />
                    <span className="text-white font-medium">Exclusive premium features</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-white mt-0.5 flex-shrink-0" size={20} fill="currentColor" />
                    <span className="text-white font-medium">Priority support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-white mt-0.5 flex-shrink-0" size={20} fill="currentColor" />
                    <span className="text-white font-medium">Export and backup your progress</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
              Frequently Asked Questions
            </h3>
            <div className="space-y-6 max-w-3xl mx-auto">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Can I cancel anytime?
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Yes! You can cancel your premium subscription at any time. You'll continue to have access until the end of your billing period.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  What happens to my goals if I downgrade?
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Your existing goals will remain accessible, but you won't be able to create new goals beyond the free plan limit until you upgrade again.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Is my payment information secure?
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Absolutely! We use Stripe for secure payment processing. We never store your payment information on our servers.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PricingContent />
    </Suspense>
  );
}
