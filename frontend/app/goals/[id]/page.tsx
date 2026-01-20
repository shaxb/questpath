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
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50">
      <Navbar />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Back Button */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>

        {/* Goal Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{goal.title}</h1>
          <p className="text-gray-600 text-lg mb-4">{goal.roadmap.name}</p>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setSelectedLevel(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden animate-slide-up" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white relative">
              <button
                onClick={() => setSelectedLevel(null)}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-4xl font-black">{selectedLevel.order}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedLevel.title}</h2>
                  <p className="text-purple-100">{selectedLevel.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Trophy size={20} />
                  <span className="font-bold">{selectedLevel.xp_reward} XP</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">
                    {getLevelProgress(selectedLevel).completed}/{getLevelProgress(selectedLevel).total} Topics
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              
              {/* Topics Section */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📚 Topics to Master</h3>
                <div className="space-y-2">
                  {selectedLevel.topics.map((topic, topicIndex) => (
                    <button
                      key={topicIndex}
                      onClick={() => handleTopicToggle(selectedLevel.id, topicIndex)}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${
                        topic.completed
                          ? 'bg-green-50 hover:bg-green-100 border-2 border-green-200'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      {topic.completed ? (
                        <CheckCircle2 className="text-green-600 flex-shrink-0" size={24} />
                      ) : (
                        <Circle className="text-gray-400 flex-shrink-0" size={24} />
                      )}
                      <span className={`text-left font-medium ${topic.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {topic.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quiz Button */}
              <button
                onClick={() => selectedLevel && startQuiz(selectedLevel)}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
              >
                <Brain size={24} />
                Take Quiz & Earn {selectedLevel.xp_reward} XP
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
