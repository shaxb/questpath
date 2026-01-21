'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Trophy, Lock, CheckCircle2, Circle, ArrowLeft, Sparkles, X, Brain } from 'lucide-react';
import QuizModal from '@/components/quiz/QuizModal';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Loading from '@/components/ui/Loading';
import ErrorDisplay from '@/components/ui/ErrorDisplay';

interface Topic {
  name: string;
  completed: boolean;
}

interface Level {
  id: number;
  order: number;
  title: string;
  description: string;
  topics: Topic[];
  xp_reward: number;
  status: string;
}

interface Roadmap {
  id: number;
  name: string;
  levels: Level[];
}

interface Goal {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  status: string;
  roadmap: Roadmap;
}

export default function GoalDetailPage() {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [quizLevel, setQuizLevel] = useState<Level | null>(null);
  
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const fetchGoal = async () => {
      try {
        const response = await api.get(`/goals/${params.id}`);
        setGoal(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load goal');
        if (err.response?.status === 401) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGoal();
  }, [params.id, router]);

  const handleTopicToggle = async (levelId: number, topicIndex: number) => {
    try {
      await api.patch(`/goals/levels/${levelId}/topics/${topicIndex}`);
      
      // Update both goal state and selectedLevel state
      setGoal(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          roadmap: {
            ...prev.roadmap,
            levels: prev.roadmap.levels.map(level => {
              if (level.id === levelId) {
                const newTopics = [...level.topics];
                newTopics[topicIndex] = {
                  ...newTopics[topicIndex],
                  completed: !newTopics[topicIndex].completed
                };
                const updatedLevel = { ...level, topics: newTopics };
                
                // Update selected level if it's currently open
                if (selectedLevel?.id === levelId) {
                  setSelectedLevel(updatedLevel);
                }
                
                return updatedLevel;
              }
              return level;
            })
          }
        };
      });
    } catch (err) {
      console.error('Failed to toggle topic:', err);
    }
  };

  const startQuiz = (level: Level) => {
    setQuizLevel(level);
    setSelectedLevel(null); // Close level modal
  };

  const handleQuizComplete = async () => {
    // Refresh goal data to update level status
    try {
      const response = await api.get(`/goals/${params.id}`);
      setGoal(response.data);
    } catch (err) {
      console.error('Failed to refresh goal:', err);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-700';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getLevelProgress = (level: Level) => {
    const completed = level.topics.filter(t => t.completed).length;
    const total = level.topics.length;
    return { completed, total, percentage: (completed / total) * 100 };
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Loading fullPage message="Loading your roadmap..." />
      </ProtectedRoute>
    );
  }

  if (error || !goal) {
    return (
      <ProtectedRoute>
        <ErrorDisplay
          fullPage
          message={error || 'Goal not found'}
          onRetry={() => window.location.reload()}
        />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-blue-950/20">
      <Navbar />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Back Button */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 mb-6 transition-colors font-medium">
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>

        {/* Goal Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-900 via-blue-900 to-cyan-900 dark:from-purple-200 dark:via-blue-200 dark:to-cyan-200 bg-clip-text text-transparent mb-3">{goal.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg mb-4">{goal.roadmap.name}</p>
          <div className="flex gap-3 justify-center">
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${getDifficultyColor(goal.difficulty_level)}`}>
              {goal.difficulty_level}
            </span>
            <span className="px-4 py-2 rounded-full text-sm font-bold bg-purple-100 text-purple-700">
              {goal.category}
            </span>
          </div>
        </div>

        {/* Duolingo-style Path */}
        <div className="relative flex flex-col items-center space-y-8 pb-16">
          {goal.roadmap.levels.map((level, index) => {
            const progress = getLevelProgress(level);
            const isLocked = level.status === 'locked';
            const isCompleted = progress.percentage === 100;
            
            return (
              <div key={level.id} className="relative flex flex-col items-center">
                {/* Connecting Line */}
                {index < goal.roadmap.levels.length - 1 && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-1 h-8 bg-gray-300 z-0" />
                )}
                
                {/* Level Node (Square Island) */}
                <button
                  onClick={() => !isLocked && setSelectedLevel(level)}
                  disabled={isLocked}
                  style={{ animationDelay: `${index * 100}ms` }}
                  className={`relative z-10 w-24 h-24 rounded-2xl shadow-lg flex flex-col items-center justify-center transition-all duration-300 animate-slide-up ${
                    isLocked
                      ? 'bg-gray-300 cursor-not-allowed'
                      : isCompleted
                      ? 'bg-gradient-to-br from-green-400 to-green-600 hover:scale-110 hover:shadow-xl'
                      : 'bg-gradient-to-br from-purple-400 to-purple-600 hover:scale-110 hover:shadow-xl'
                  }`}
                >
                  {isLocked ? (
                    <Lock className="text-white" size={32} />
                  ) : isCompleted ? (
                    <CheckCircle2 className="text-white" size={32} />
                  ) : (
                    <span className="text-3xl font-black text-white">{level.order}</span>
                  )}
                  
                  {/* Progress indicator */}
                  {!isLocked && !isCompleted && (
                    <div className="absolute bottom-2 w-16 h-1 bg-white/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white transition-all duration-300"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                  )}
                </button>

                {/* Level Title */}
                <p className="mt-3 text-sm font-bold text-gray-700 text-center max-w-xs">
                  {level.title}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Level Detail Modal */}
      {selectedLevel && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setSelectedLevel(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slide-up border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 dark:from-purple-700 dark:via-blue-700 dark:to-cyan-700 p-6 sm:p-8 text-white relative">
              <button
                onClick={() => setSelectedLevel(null)}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-all hover:scale-110 active:scale-95"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4 pr-10">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-3xl sm:text-4xl font-black">{selectedLevel.order}</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold mb-1">{selectedLevel.title}</h2>
                  <p className="text-purple-100 dark:text-blue-100 text-sm sm:text-base">{selectedLevel.description}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <Trophy size={18} />
                  <span className="font-bold">{selectedLevel.xp_reward} XP</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <span className="font-bold">
                    {getLevelProgress(selectedLevel).completed}/{getLevelProgress(selectedLevel).total} Topics
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              
              {/* Topics Section */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <span>📚</span>
                  <span>Topics to Master</span>
                </h3>
                <div className="space-y-2.5">
                  {selectedLevel.topics.map((topic, topicIndex) => (
                    <button
                      key={topicIndex}
                      onClick={() => handleTopicToggle(selectedLevel.id, topicIndex)}
                      className={`w-full flex items-center gap-3 p-3.5 sm:p-4 rounded-xl transition-all duration-200 text-left group ${
                        topic.completed
                          ? 'bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 border-2 border-green-300 dark:border-green-700'
                          : 'bg-gray-50 hover:bg-purple-50 dark:bg-gray-800 dark:hover:bg-purple-900/20 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600'
                      }`}
                    >
                      {topic.completed ? (
                        <CheckCircle2 className="text-green-600 dark:text-green-400 flex-shrink-0 transition-transform group-hover:scale-110" size={22} />
                      ) : (
                        <Circle className="text-gray-400 dark:text-gray-500 flex-shrink-0 transition-transform group-hover:scale-110" size={22} />
                      )}
                      <span className={`font-medium text-sm sm:text-base ${
                        topic.completed 
                          ? 'text-gray-500 dark:text-gray-400 line-through' 
                          : 'text-gray-900 dark:text-gray-100 group-hover:text-purple-700 dark:group-hover:text-purple-300'
                      }`}>
                        {topic.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quiz Button */}
              <button
                onClick={() => selectedLevel && startQuiz(selectedLevel)}
                className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white font-bold py-3.5 sm:py-4 px-6 rounded-xl transition-all shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transform"
              >
                <Brain size={24} />
                <span className="text-sm sm:text-base">Take Quiz & Earn {selectedLevel.xp_reward} XP</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal Component */}
      {quizLevel && (
        <QuizModal
          levelId={quizLevel.id}
          levelTitle={quizLevel.title}
          xpReward={quizLevel.xp_reward}
    
          onClose={() => setQuizLevel(null)}
          onComplete={handleQuizComplete}
        />
      )}
    </div>
  </ProtectedRoute>
  );
}
