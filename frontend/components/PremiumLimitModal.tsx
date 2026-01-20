'use client';

import { Crown, X, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PremiumLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  title?: string;
  isPremiumExpired?: boolean;
}

export default function PremiumLimitModal({
  isOpen,
  onClose,
  message,
  title = "Upgrade to Premium",
  isPremiumExpired = false,
}: PremiumLimitModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-md w-full p-6 animate-slide-up border border-gray-200 dark:border-gray-700">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full">
            <Crown className="text-white" size={32} fill="currentColor" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {message}
          </p>
        </div>

        {/* Premium Features */}
        {!isPremiumExpired && (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 mb-6 border border-blue-100 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-blue-600 dark:text-blue-400" size={18} />
              <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                Premium Benefits:
              </span>
            </div>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">✓</span>
                <span>Unlimited goals and roadmaps</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">✓</span>
                <span>Priority AI processing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">✓</span>
                <span>Advanced analytics and insights</span>
              </li>
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            Maybe Later
          </button>
          <button
            onClick={handleUpgrade}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-bold shadow-md hover:shadow-lg transform hover:scale-105"
          >
            {isPremiumExpired ? 'Renew Premium' : 'Upgrade Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
