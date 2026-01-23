'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Trophy, ArrowLeft, CheckCircle2, Circle, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import QuizModal from '@/components/quiz/QuizModal';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Loading from '@/components/ui/Loading';
import ErrorDisplay from '@/components/ui/ErrorDisplay';

interface Topic {
  name: string;
  explanation?: string;
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

export default function LevelTopicsPage() {
  const [level, setLevel] = useState<Level | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set());
  const [showQuiz, setShowQuiz] = useState(false);
  
  const router = useRouter();
  const params = useParams();
  const goalId = params.id as string;
  const levelId = params.levelId as string;

  useEffect(() => {
    const fetchLevel = async () => {
      try {
        const response = await api.get(`/goals/${goalId}`);
        const goal = response.data;
        const foundLevel = goal.roadmap.levels.find((l: Level) => l.id === parseInt(levelId));
        
        if (!foundLevel) {
          setError('Level not found');
        } else {
          setLevel(foundLevel);
        }
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load level');
        if (err.response?.status === 401) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLevel();
  }, [goalId, levelId, router]);

  const toggleTopic = (topicIndex: number) => {
    setExpandedTopics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topicIndex)) {
        newSet.delete(topicIndex);
      } else {
        newSet.add(topicIndex);
      }
      return newSet;
    });
  };

  const handleUnderstood = async (topicIndex: number) => {
    if (!level) return;
    
    try {
      await api.patch(`/goals/levels/${level.id}/topics/${topicIndex}`);
      
      // Update local state
      setLevel(prev => {
        if (!prev) return prev;
        const newTopics = [...prev.topics];
        newTopics[topicIndex] = {
          ...newTopics[topicIndex],
          completed: true
        };
        return { ...prev, topics: newTopics };
      });

      // Collapse the topic after marking as understood
      setExpandedTopics(prev => {
        const newSet = new Set(prev);
        newSet.delete(topicIndex);
        return newSet;
      });
    } catch (err) {
      console.error('Failed to mark topic as completed:', err);
    }
  };

  const handleQuizComplete = async () => {
    // Refresh level data
    try {
      const response = await api.get(`/goals/${goalId}`);
      const goal = response.data;
      const foundLevel = goal.roadmap.levels.find((l: Level) => l.id === parseInt(levelId));
      if (foundLevel) {
        setLevel(foundLevel);
      }
    } catch (err) {
      console.error('Failed to refresh level:', err);
    }
  };

  const allTopicsCompleted = level?.topics.every(t => t.completed) || false;
  const completedCount = level?.topics.filter(t => t.completed).length || 0;
  const totalCount = level?.topics.length || 0;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <ProtectedRoute>
        <Loading fullPage message="Loading topics..." />
      </ProtectedRoute>
    );
  }

  if (error || !level) {
    return (
      <ProtectedRoute>
        <ErrorDisplay
          fullPage
          message={error || 'Level not found'}
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
          <Link 
            href={`/goals/${goalId}`} 
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 mb-6 transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            Back to Roadmap
          </Link>

          {/* Level Header */}
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 dark:from-purple-700 dark:via-blue-700 dark:to-cyan-700 rounded-2xl p-6 sm:p-8 text-white shadow-xl mb-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-3xl sm:text-4xl font-black">{level.order}</span>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">{level.title}</h1>
                <p className="text-purple-100 dark:text-blue-100 text-sm sm:text-base">{level.description}</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold">Progress</span>
                <span className="text-sm font-bold">{completedCount}/{totalCount} Topics</span>
              </div>
              <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm w-fit">
              <Trophy size={18} />
              <span className="font-bold text-sm">Earn {level.xp_reward} XP</span>
            </div>
          </div>

          {/* Topics List */}
          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <span>📚</span>
              <span>Topics to Master</span>
            </h2>

            {level.topics.map((topic, index) => {
              const isExpanded = expandedTopics.has(index);
              const isCompleted = topic.completed;

              return (
                <div
                  key={index}
                  className={`rounded-xl border-2 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {/* Topic Header - Clickable */}
                  <button
                    onClick={() => toggleTopic(index)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors rounded-xl"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {isCompleted ? (
                        <CheckCircle2 className="text-green-600 dark:text-green-400 flex-shrink-0" size={24} />
                      ) : (
                        <Circle className="text-gray-400 dark:text-gray-500 flex-shrink-0" size={24} />
                      )}
                      <span className={`font-medium text-base sm:text-lg ${
                        isCompleted 
                          ? 'text-gray-600 dark:text-gray-400' 
                          : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {topic.name}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="text-gray-500 dark:text-gray-400 flex-shrink-0" size={24} />
                    ) : (
                      <ChevronDown className="text-gray-500 dark:text-gray-400 flex-shrink-0" size={24} />
                    )}
                  </button>

                  {/* Topic Explanation - Expandable */}
                  {isExpanded && (
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 animate-slide-down">
                      <div className="pl-9 border-l-4 border-purple-300 dark:border-purple-600 ml-3">
                        <div className="pl-4">
                          {topic.explanation ? (
                            <>
                              <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
                                {topic.explanation}
                              </p>
                              {!isCompleted && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnderstood(index);
                                  }}
                                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-2.5 px-6 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transform"
                                >
                                  <CheckCircle2 size={20} />
                                  <span>Understood</span>
                                </button>
                              )}
                            </>
                          ) : (
                            <p className="text-gray-500 dark:text-gray-400 italic text-sm">
                              No explanation available yet.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quiz Button - Activated when all topics completed */}
          <div className="sticky bottom-6 z-10">
            <button
              onClick={() => setShowQuiz(true)}
              disabled={!allTopicsCompleted}
              className={`w-full font-bold py-4 px-6 rounded-xl transition-all shadow-xl flex items-center justify-center gap-3 transform ${
                allTopicsCompleted
                  ? 'bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white hover:scale-105 active:scale-95 shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 cursor-pointer'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-60'
              }`}
            >
              <Brain size={24} />
              <span className="text-base sm:text-lg">
                {allTopicsCompleted 
                  ? `Take Quiz & Earn ${level.xp_reward} XP` 
                  : `Complete all topics to unlock quiz (${completedCount}/${totalCount})`
                }
              </span>
            </button>
          </div>
        </div>

        {/* Quiz Modal */}
        {showQuiz && (
          <QuizModal
            levelId={level.id}
            levelTitle={level.title}
            xpReward={level.xp_reward}
            onClose={() => setShowQuiz(false)}
            onComplete={handleQuizComplete}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
