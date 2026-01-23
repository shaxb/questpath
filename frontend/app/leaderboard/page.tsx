'use client';

import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Crown, User as UserIcon } from 'lucide-react';
import api from '@/lib/api';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Loading from '@/components/ui/Loading';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import { useUser } from '@/contexts/UserContext';

interface LeaderboardEntry {
  rank: number;
  user_id: number;
  email: string;
  total_exp: number;
  is_premium?: boolean;
  display_name?: string;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  current_user: LeaderboardEntry;
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useUser();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get('/leaderboard');
        setData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="text-yellow-500 dark:text-yellow-400" size={24} fill="currentColor" />;
      case 2:
        return <Medal className="text-gray-400 dark:text-gray-300" size={24} fill="currentColor" />;
      case 3:
        return <Medal className="text-amber-700 dark:text-amber-400" size={24} fill="currentColor" />;
      default:
        return <span className="text-lg font-bold text-gray-500 dark:text-gray-300 w-6 text-center">{rank}</span>;
    }
  };

  const getRowStyle = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return 'bg-blue-50 border-blue-200 ring-1 ring-blue-300 dark:bg-blue-900/20 dark:border-blue-700 dark:ring-blue-800';
    if (rank === 1) return 'bg-yellow-50/50 border-yellow-100 dark:bg-yellow-900/10 dark:border-yellow-700';
    if (rank === 2) return 'bg-gray-50/50 border-gray-100 dark:bg-gray-800 dark:border-gray-700';
    if (rank === 3) return 'bg-orange-50/50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-700';
    return 'bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700';
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Loading fullPage message="Loading leaderboard..." />
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <Navbar />
        
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100 mb-2 flex items-center justify-center gap-3">
              <Trophy className="text-yellow-500 dark:text-yellow-400" size={40} />
              Leaderboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">See who's leading the quest for knowledge!</p>
          </div>

          {data && (
            <div className="space-y-6">
              {/* Your Rank Card */}
              <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border-2 border-blue-100 dark:border-blue-800 flex items-center justify-between mb-6 sm:mb-8 transform transition-all hover:shadow-md">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-base sm:text-xl">
                    #{data.current_user.rank}
                  </div>
                  <div>
                    <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-gray-100">Your Rank</h2>
                    <p className="text-xs sm:text-base text-gray-500 dark:text-gray-300 truncate max-w-[120px] sm:max-w-none">{data.current_user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl sm:text-3xl font-black text-blue-600 dark:text-blue-300">{data.current_user.total_exp}</p>
                  <p className="text-xs sm:text-sm font-bold text-blue-400 dark:text-blue-300 uppercase tracking-wider">XP</p>
                </div>
              </div>

              {/* Leaderboard List */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-gray-700">
                        <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16 sm:w-24">Rank</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-4 text-right text-xs sm:text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">XP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {data.leaderboard.map((entry) => {
                        const isCurrentUser = user?.id === entry.user_id;
                        return (
                          <tr 
                            key={entry.user_id} 
                            className={`transition-colors ${getRowStyle(entry.rank, isCurrentUser)}`}
                          >
                            <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                              <div className="flex items-center justify-center w-6 sm:w-8">
                                {getRankIcon(entry.rank)}
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className={`p-1.5 sm:p-2 rounded-full ${isCurrentUser ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300'}`}>
                                  <UserIcon size={16} className="sm:w-5 sm:h-5" />
                                </div>
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-1 sm:gap-2">
                                    <span className={`text-sm sm:text-base font-medium ${isCurrentUser ? 'text-blue-900 font-bold dark:text-blue-300' : 'text-gray-700 dark:text-gray-200'} truncate max-w-[100px] sm:max-w-none`}>
                                      {entry.display_name || entry.email.split('@')[0]}
                                    </span>
                                    {entry.is_premium && (
                                      <span className="inline-flex items-center gap-0.5 sm:gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full">
                                        <Crown size={10} className="sm:w-3 sm:h-3" fill="currentColor" />
                                        PRO
                                      </span>
                                    )}
                                    {isCurrentUser && (
                                      <span className="text-[10px] sm:text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 px-1.5 sm:px-2 py-0.5 rounded-full font-semibold">YOU</span>
                                    )}
                                  </div>
                                  {entry.display_name && (
                                    <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px] sm:max-w-none">{entry.email}</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-right">
                              <span className="text-sm sm:text-base font-black text-gray-900 dark:text-gray-100">{entry.total_exp}</span>
                              <span className="hidden sm:inline text-xs text-gray-400 dark:text-gray-400 ml-1 font-medium">XP</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                {data.leaderboard.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    No active users yet. Be the first to earn XP!
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
