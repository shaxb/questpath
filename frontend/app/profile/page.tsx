'use client';

import { useState, useEffect } from 'react';
import { User as UserIcon, Trophy, Target, Award, Edit2, Check, X, Crown } from 'lucide-react';
import api from '@/lib/api';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Loading from '@/components/ui/Loading';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import { useUser } from '@/contexts/UserContext';
import toast from 'react-hot-toast';

interface ProfileStats {
  email: string;
  display_name: string | null;
  profile_picture: string | null;
  total_exp: number;
  levels_completed: number;
  goal_completion_percentage: number;
}

export default function ProfilePage() {
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const { user, refreshUser, getLevel } = useUser();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/progression/stats');
        setStats(response.data);
        setDisplayName(response.data.display_name || '');
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/auth/me', { display_name: displayName.trim() });
      toast.success('Profile updated!');
      setIsEditing(false);
      
      // Refresh user context and stats
      await refreshUser();
      const response = await api.get('/progression/stats');
      setStats(response.data);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(stats?.display_name || '');
    setIsEditing(false);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Loading fullPage message="Loading your profile..." />
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <ErrorDisplay 
          fullPage 
          message={error} 
          onRetry={() => window.location.reload()} 
        />
      </ProtectedRoute>
    );
  }

  const level = getLevel();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <Navbar />
        
        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Profile Header */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-700 dark:to-purple-800 rounded-3xl p-8 mb-8 text-white shadow-lg">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-4 border-white/30 dark:border-white/10">
                {stats?.profile_picture ? (
                  <img 
                    src={stats.profile_picture} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <UserIcon size={48} className="text-white" />
                )}
              </div>

              {/* User Info */}
              <div className="flex-1">
                {isEditing ? (
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter display name"
                      className="px-3 py-2 rounded-lg text-gray-900 dark:text-gray-100 border-2 border-white/30 dark:border-white/10 bg-white/80 dark:bg-slate-700 focus:border-white focus:outline-none"
                      disabled={saving}
                    />
                    <button
                      onClick={handleSave}
                      disabled={saving || !displayName.trim()}
                      className="p-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Check size={20} />
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-black text-white dark:text-white">
                      {stats?.display_name || 'Unnamed Hero'}
                    </h1>
                    {user?.is_premium && (
                      <span className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                        <Crown size={16} fill="currentColor" />
                        PREMIUM
                      </span>
                    )}
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                  </div>
                )}
                <p className="text-white/80 text-lg">{stats?.email}</p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="px-4 py-1 bg-white/20 rounded-full backdrop-blur-sm font-bold">
                    Level {level}
                  </div>
                  <div className="px-4 py-1 bg-white/20 rounded-full backdrop-blur-sm font-bold">
                    {stats?.total_exp} XP
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total XP */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Award className="text-yellow-600" size={24} />
                </div>
                <h3 className="font-bold text-gray-500 text-sm uppercase tracking-wider">Total XP</h3>
              </div>
              <p className="text-4xl font-black text-gray-900 dark:text-gray-100">{stats?.total_exp}</p>
              <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">Experience Points</p>
            </div>

            {/* Levels Completed */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Trophy className="text-green-600" size={24} />
                </div>
                <h3 className="font-bold text-gray-500 text-sm uppercase tracking-wider">Levels Done</h3>
              </div>
              <p className="text-4xl font-black text-gray-900 dark:text-gray-100">{stats?.levels_completed}</p>
              <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">Challenges Completed</p>
            </div>

            {/* Completion Rate */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Target className="text-blue-600" size={24} />
                </div>
                <h3 className="font-bold text-gray-500 text-sm uppercase tracking-wider">Progress</h3>
              </div>
              <p className="text-4xl font-black text-gray-900 dark:text-gray-100">{stats?.goal_completion_percentage}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">Overall Completion</p>
            </div>
          </div>

          {/* Progress Bar */}
          {stats && stats.goal_completion_percentage > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Your Journey</h3>
              <div className="relative">
                <div className="w-full h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 transition-all duration-500 flex items-center justify-end px-2"
                    style={{ width: `${stats.goal_completion_percentage}%` }}
                  >
                    {stats.goal_completion_percentage > 10 && (
                      <span className="text-xs font-bold text-white">
                        {stats.goal_completion_percentage}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-300 mt-3">
                Keep going! You've completed {stats.levels_completed} levels so far.
              </p>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
