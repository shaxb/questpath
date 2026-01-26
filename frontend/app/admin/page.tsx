'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Users, Target, Zap, TrendingUp } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Loading from '@/components/ui/Loading';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import api from '@/lib/api';

interface AdminStats {
  timestamp: string;
  users: {
    total: number;
    today: number;
    this_week: number;
    premium_active: number;
  };
  goals: {
    total: number;
    today: number;
    this_week: number;
  };
  events_today: {
    total: number;
    by_type: Record<string, number>;
    recent: Array<{
      id: number;
      type: string;
      user_id: number | null;
      data: any;
      created_at: string;
    }>;
  };
  top_users: Array<{
    id: number;
    email: string;
    display_name: string | null;
    total_exp: number;
    is_premium: boolean;
  }>;
  recent_signups: Array<{
    id: number;
    email: string;
    display_name: string | null;
    created_at: string;
    is_premium: boolean;
  }>;
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load admin stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute>
        <Loading fullPage message="Loading admin dashboard..." />
      </ProtectedRoute>
    );
  }

  if (error || !stats) {
    return (
      <ProtectedRoute>
        <ErrorDisplay
          fullPage
          message={error || 'Failed to load stats'}
          onRetry={() => window.location.reload()}
        />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="text-purple-600 dark:text-purple-400" size={32} />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Last updated: {new Date(stats.timestamp).toLocaleString()}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Users */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Users className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  +{stats.users.today} today
                </span>
              </div>
              <p className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-1">
                {stats.users.total}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Users</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {stats.users.this_week} this week
              </p>
            </div>

            {/* Premium Users */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <Zap className="text-yellow-600 dark:text-yellow-400" size={24} />
                </div>
              </div>
              <p className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-1">
                {stats.users.premium_active}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Active Premium</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {((stats.users.premium_active / stats.users.total) * 100).toFixed(1)}% of users
              </p>
            </div>

            {/* Total Goals */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Target className="text-purple-600 dark:text-purple-400" size={24} />
                </div>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  +{stats.goals.today} today
                </span>
              </div>
              <p className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-1">
                {stats.goals.total}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Goals</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {stats.goals.this_week} this week
              </p>
            </div>

            {/* Events Today */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
                </div>
              </div>
              <p className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-1">
                {stats.events_today.total}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Events Today</p>
            </div>
          </div>

          {/* Event Types */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Events Today by Type
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(stats.events_today.by_type).map(([type, count]) => (
                <div key={type} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{count}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{type.replace(/_/g, ' ')}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Top Users */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Top Users by XP
              </h2>
              <div className="space-y-3">
                {stats.top_users.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-500 dark:text-gray-400 w-6">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {user.display_name || user.email.split('@')[0]}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-gray-100">{user.total_exp} XP</p>
                      {user.is_premium && (
                        <span className="text-xs text-yellow-600 dark:text-yellow-400">Premium</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Signups */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Recent Signups
              </h2>
              <div className="space-y-3">
                {stats.recent_signups.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {user.display_name || user.email.split('@')[0]}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {new Date(user.created_at).toLocaleString()}
                      </p>
                      {user.is_premium && (
                        <span className="text-xs text-yellow-600 dark:text-yellow-400">Premium</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Events */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Recent Events (Last 20)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Time</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Type</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">User ID</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.events_today.recent.map((event) => (
                    <tr
                      key={event.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
                    >
                      <td className="p-3 text-sm text-gray-600 dark:text-gray-300">
                        {new Date(event.created_at).toLocaleTimeString()}
                      </td>
                      <td className="p-3 text-sm">
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">
                          {event.type}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-gray-600 dark:text-gray-300">
                        {event.user_id || '-'}
                      </td>
                      <td className="p-3 text-sm text-gray-600 dark:text-gray-300">
                        {event.data && Object.keys(event.data).length > 0 ? (
                          <code className="text-xs">{JSON.stringify(event.data)}</code>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
