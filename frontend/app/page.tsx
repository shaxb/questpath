import Link from 'next/link';
import { ArrowRight, Target, TrendingUp, Users, Zap, Award, BookOpen, Trophy } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Trophy className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                QuestPath
              </span>
            </div>
            <div className="flex gap-3">
              <Link 
                href="/login"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
              >
                Login
              </Link>
              <Link 
                href="/register"
                className="px-3 py-1.5 sm:px-6 sm:py-2 text-sm sm:text-base bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-500/30 font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-6">
              <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Level up your learning journey
              </span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900 dark:from-white dark:via-purple-200 dark:to-blue-200 bg-clip-text text-transparent leading-tight">
              Transform Learning Into an Epic Adventure
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
              Gamify your goals with RPG-style progression. Earn XP, unlock achievements, 
              and compete on leaderboards while mastering new skills.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <Link 
                href="/register"
                className="group px-5 py-2.5 sm:px-8 sm:py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg sm:rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 font-semibold text-base sm:text-lg flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                Start Your Quest
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/leaderboard"
                className="px-5 py-2.5 sm:px-8 sm:py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg sm:rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 transition-all font-semibold text-base sm:text-lg w-full sm:w-auto justify-center flex items-center"
              >
                View Leaderboard
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">1000+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Active Learners</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">50K+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Goals Completed</div>
              </div>
              <div className="text-center col-span-2 sm:col-span-1">
                <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">95%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Why Choose QuestPath?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Learning doesn't have to be boring. Make it engaging, competitive, and rewarding.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-100 dark:border-purple-800/30 hover:shadow-xl hover:shadow-purple-500/10 dark:hover:shadow-purple-500/20 transition-all">
              <div className="w-14 h-14 bg-purple-600 dark:bg-purple-500 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Goal Tracking</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Set personalized learning goals and break them into achievable quests. Track your progress with detailed analytics.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-100 dark:border-blue-800/30 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20 transition-all">
              <div className="w-14 h-14 bg-blue-600 dark:bg-blue-500 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">RPG Progression</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Earn XP, level up your character, and unlock special achievements as you complete quests and challenges.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800/30 hover:shadow-xl hover:shadow-green-500/10 dark:hover:shadow-green-500/20 transition-all">
              <div className="w-14 h-14 bg-green-600 dark:bg-green-500 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Compete & Connect</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Join a global community of learners. Compete on leaderboards and stay motivated together.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-100 dark:border-orange-800/30 hover:shadow-xl hover:shadow-orange-500/10 dark:hover:shadow-orange-500/20 transition-all">
              <div className="w-14 h-14 bg-orange-600 dark:bg-orange-500 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">AI-Powered Quizzes</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Test your knowledge with intelligent quizzes tailored to your learning path and difficulty level.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border border-pink-100 dark:border-pink-800/30 hover:shadow-xl hover:shadow-pink-500/10 dark:hover:shadow-pink-500/20 transition-all">
              <div className="w-14 h-14 bg-pink-600 dark:bg-pink-500 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Award className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Achievements</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Unlock badges and achievements as you hit milestones. Show off your accomplishments to the community.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 border border-indigo-100 dark:border-indigo-800/30 hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/20 transition-all">
              <div className="w-14 h-14 bg-indigo-600 dark:bg-indigo-500 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Premium Features</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Upgrade to unlock unlimited goals, advanced analytics, and exclusive achievements for serious learners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              Start Your Journey in 3 Simple Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center text-3xl font-bold text-white mx-auto mb-6 shadow-xl shadow-purple-500/30">
                1
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Create Your Account</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Sign up in seconds and start your personalized learning adventure.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center text-3xl font-bold text-white mx-auto mb-6 shadow-xl shadow-blue-500/30">
                2
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Set Your Goals</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Define what you want to learn and we'll create quests to get you there.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-600 to-green-600 rounded-2xl flex items-center justify-center text-3xl font-bold text-white mx-auto mb-6 shadow-xl shadow-green-500/30">
                3
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Level Up!</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Complete quests, earn XP, and watch yourself grow on the leaderboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 dark:from-purple-700 dark:via-blue-700 dark:to-cyan-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
            Ready to Level Up Your Learning?
          </h2>
          <p className="text-xl text-purple-100 mb-10">
            Join thousands of learners who are achieving their goals through gamified learning.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register"
              className="group px-8 py-4 bg-white text-purple-700 rounded-xl hover:bg-gray-100 transition-all shadow-xl font-semibold text-lg flex items-center gap-2 justify-center"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/pricing"
              className="px-8 py-4 bg-purple-800/50 text-white rounded-xl border-2 border-white/30 hover:bg-purple-800/70 transition-all font-semibold text-lg"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                QuestPath
              </span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <Link href="/pricing" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Pricing
              </Link>
              <Link href="/leaderboard" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Leaderboard
              </Link>
              <Link href="/dashboard" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Dashboard
              </Link>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              © 2026 QuestPath. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}