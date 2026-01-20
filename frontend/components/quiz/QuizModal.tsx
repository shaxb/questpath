'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Clock, CheckCircle2, Trophy, Award } from 'lucide-react';
import api from '@/lib/api';
import { useUser } from '@/contexts/UserContext';
import toast from 'react-hot-toast';
import Loading from '@/components/ui/Loading';

interface QuizOption {
  text: string;
  value: string;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
  correct_answer: string;
}

interface QuizData {
  level_id: number;
  level_title: string;
  time_limit: number;
  questions: QuizQuestion[];
}

interface QuizModalProps {
  levelId: number;
  levelTitle: string;
  xpReward: number;
  onClose: () => void;
  onComplete: () => void;
}

export default function QuizModal({ levelId, levelTitle, xpReward, onClose, onComplete }: QuizModalProps) {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);
  
  const { refreshUser } = useUser();

  // Load quiz on mount (only once when modal opens)
  useEffect(() => {
    // Don't re-fetch if we already have quiz data or if quiz is completed
    if (quizData || quizCompleted) return;
    
    const fetchQuiz = async () => {
      try {
        const response = await api.get(`/levels/${levelId}/quiz`);
        setQuizData(response.data);
        setLoading(false);
      } catch (err: any) {
        toast.error(err.response?.data?.detail || 'Failed to load quiz');
        onClose();
      }
    };

    fetchQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelId]);

  // Define handlers before useEffect that uses them
  const handleAnswerSelect = (answer: string) => {
    if (!showFeedback) {
      setSelectedAnswer(answer);
    }
  };

  const handleAnswerSubmit = useCallback(() => {
    if (!quizData || showFeedback) return;
    
    const currentQuestion = quizData.questions[currentQuestionIndex];
    const answer = selectedAnswer || '';
    
    // Save answer
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
    
    setShowFeedback(true);
  }, [quizData, showFeedback, currentQuestionIndex, selectedAnswer]);

  // Timer countdown
  useEffect(() => {
    if (!loading && !showFeedback && !quizCompleted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
    
    // Auto-submit when time runs out (only if no answer submitted yet)
    if (timeLeft === 0 && !showFeedback && !quizCompleted) {
      handleAnswerSubmit();
    }
  }, [loading, showFeedback, quizCompleted, timeLeft, handleAnswerSubmit]);

  const handleNextQuestion = () => {
    if (!quizData) return;
    
    setShowFeedback(false);
    setSelectedAnswer(null);
    
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(60);
    } else {
      // Quiz finished, calculate results
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    if (!quizData || quizCompleted) return; // Prevent running twice
    
    // Calculate score
    let correctCount = 0;
    quizData.questions.forEach(question => {
      if (answers[question.id] === question.correct_answer) {
        correctCount++;
      }
    });
    
    const score = Math.round((correctCount / quizData.questions.length) * 100);
    const passed = score >= 80;
    
    // Set completed FIRST to prevent re-triggering
    setQuizCompleted(true);
    
    try {
      // Server-first: Save to database first
      const response = await api.post(`/levels/${quizData.level_id}/quiz/submit`, {
        score,
        passed,
        time_taken: 0
      });
      
      setQuizResults({
        score,
        passed,
        correctCount,
        totalQuestions: quizData.questions.length,
        xp_earned: response.data.xp_earned,
        message: response.data.message
      });
      
      // Refresh user from server to get updated XP (source of truth)
      await refreshUser();
    } catch (err) {
      console.error('Failed to submit quiz:', err);
      // Even if submission fails, keep quiz completed
    }
  };

  const handleClose = () => {
    if (quizCompleted) {
      onComplete(); // Refresh parent data
    }
    onClose();
  };

  if (loading || (quizCompleted && !quizResults)) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-blue-600 to-purple-600 z-50">
        <Loading fullPage message={quizCompleted ? "Submitting results..." : "Loading quiz..."} />
      </div>
    );
  }

  if (!quizData) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-blue-600 to-purple-600 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-auto relative">
        
        {!quizCompleted ? (
          <>
            {/* Quiz Header */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4 text-white dark:bg-black/40">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-bold">{levelTitle}</h2>
                  <p className="text-white/80 text-sm">Question {currentQuestionIndex + 1} of {quizData.questions.length}</p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / quizData.questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Timer */}
            <div className="flex justify-center mb-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-lg ${
                timeLeft <= 10 ? 'bg-red-500 animate-pulse' : 'bg-white/20 backdrop-blur-sm dark:bg-white/10'
              } text-white`}>
                <Clock size={20} />
                {timeLeft}s
              </div>
            </div>

            {/* Question Card */}
            <div key={currentQuestionIndex} className="bg-white rounded-2xl p-6 shadow-2xl mb-4 animate-slide-up dark:bg-slate-800">
              <h3 className="text-xl font-bold text-gray-900 mb-6 dark:text-white">
                {quizData.questions[currentQuestionIndex].question}
              </h3>

              {/* Answer Options */}
              <div className="space-y-4">
                {quizData.questions[currentQuestionIndex].options.map((option) => {
                  const isSelected = selectedAnswer === option.value;
                  const isCorrect = option.value === quizData.questions[currentQuestionIndex].correct_answer;
                  const showCorrect = showFeedback && isCorrect;
                  const showWrong = showFeedback && isSelected && !isCorrect;

                  return (
                    <button
                      key={option.value}
                      onClick={() => handleAnswerSelect(option.value)}
                      disabled={showFeedback}
                      className={`w-full p-4 rounded-2xl text-left font-medium transition-all duration-300 ${
                        showCorrect
                          ? 'bg-green-500 text-white border-4 border-green-600'
                          : showWrong
                          ? 'bg-red-500 text-white border-4 border-red-600 animate-shake'
                          : isSelected
                          ? 'bg-blue-500 text-white border-4 border-blue-600 scale-105'
                          : 'bg-gray-100 hover:bg-gray-200 border-4 border-transparent hover:border-blue-300 text-gray-900 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white'
                      } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-102'}`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`text-xl font-black ${isSelected || showCorrect || showWrong ? 'text-white' : 'text-gray-700 dark:text-gray-200'}`}>{option.value}</span>
                        <span className="text-base dark:text-gray-200">{option.text}</span>
                        {showCorrect && <CheckCircle2 className="ml-auto" size={24} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Button (sticky within modal scroll area) */}
            <div className="flex justify-center sticky bottom-4 bg-transparent py-2">
              {!showFeedback ? (
                <button
                  onClick={handleAnswerSubmit}
                  disabled={!selectedAnswer}
                  className={`px-10 py-3 rounded-full font-bold text-lg transition-all ${selectedAnswer ? 'bg-white text-blue-600 hover:scale-105 shadow-xl dark:bg-slate-100 dark:text-blue-600' : 'bg-white/20 text-white/50 cursor-not-allowed dark:bg-white/10 dark:text-white/40'}`}>
                  CHECK
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-10 py-3 rounded-full font-bold text-lg bg-white text-blue-600 hover:scale-105 shadow-xl transition-all"
                >
                  {currentQuestionIndex < quizData.questions.length - 1 ? 'NEXT' : 'SEE RESULTS'}
                </button>
              )}
            </div>
          </>
        ) : (
          /* Results Screen */
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center animate-slide-up dark:bg-slate-800">
            <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${
              quizResults.passed ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {quizResults.passed ? (
                <Trophy className="text-green-600" size={48} />
              ) : (
                <X className="text-red-600" size={48} />
              )}
            </div>

            <h2 className={`text-2xl font-black mb-4 ${
              quizResults.passed ? 'text-green-600' : 'text-red-600'
            }`}>
              {quizResults.passed ? 'QUIZ PASSED!' : 'QUIZ FAILED'}
            </h2>

            <p className="text-xl text-gray-700 mb-2 dark:text-white">
              Score: {quizResults.score}%
            </p>
            <p className="text-base text-gray-600 mb-6 dark:text-gray-300">
              {quizResults.correctCount} out of {quizResults.totalQuestions} correct
            </p>

            {quizResults.passed && (
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-center gap-3 text-2xl font-black text-orange-600">
                  <Award size={30} />
                  +{quizResults.xp_earned} XP
                </div>
              </div>
            )}

            <p className="text-gray-600 mb-6 dark:text-gray-300">{quizResults.message}</p>

            <button
              onClick={handleClose}
              className="px-10 py-3 rounded-full font-bold text-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:scale-105 shadow-xl transition-all"
            >
              CONTINUE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
