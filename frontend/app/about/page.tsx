import Link from 'next/link';
import { Github, Send, Code2, Database, Cloud, Sparkles, Rocket, Heart } from 'lucide-react';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'About - QuestPath',
  description: 'Learn about QuestPath and the technology behind it',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
              About the Project
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-900 via-blue-900 to-cyan-900 dark:from-purple-200 dark:via-blue-200 dark:to-cyan-200 bg-clip-text text-transparent mb-4">
            Built with Passion & Purpose
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            QuestPath is a gamified learning platform that transforms education into an engaging RPG-style adventure
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Rocket className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">The Mission</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Learning should be exciting, not boring. This is my side project for learning how to build full-stack applications. For a while, I haven't pushed my boundaries as a developer, and this project is my attempt to do so. Deployment, infrastructure, and DevOps are some of the areas I want to explore more with this project. And I did—as always, new techs and tools feel strange at first, but as I get more familiar with them, damn, I realize I've been doing it wrong all this time by not using this stuff.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            Abduxalilov Shaxboz
          </p>
        </div>

        {/* Tech Stack Section */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-2xl border border-purple-200 dark:border-purple-800 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Code2 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Technology Stack</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Frontend */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="text-2xl">⚡</span> Frontend
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Next.js 16 with TypeScript
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  TailwindCSS for styling
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  NextAuth for authentication
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  React Hot Toast for notifications
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Lucide Icons
                </li>
              </ul>
            </div>

            {/* Backend */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Backend
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  FastAPI (Python 3.13)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  PostgreSQL 15 database
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Redis for caching
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  SQLAlchemy 2.0 ORM
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Alembic for migrations
                </li>
              </ul>
            </div>

            {/* AI & Services */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                AI & Services
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  OpenAI GPT-4 for roadmap generation
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  AI-powered quiz creation
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Stripe for payments
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Google OAuth integration
                </li>
              </ul>
            </div>

            {/* Infrastructure */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Cloud className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                Infrastructure
              </h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                  Docker & Docker Compose
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                  Nginx reverse proxy
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                  AWS EC2 hosting
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                  GitHub Actions CI/CD
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                  SSL/TLS with Let's Encrypt
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* About Developer */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-8 h-8 text-red-500 dark:text-red-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">About the Developer, Me</h2>
          </div>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Hi! I'm Shaxboz, a passionate self-taught full-stack developer from Uzbekistan. I love building projects that solve real problems, and tech is fun and awesome.
              You don't truly understand something until you go deep. From languages like Python to C++, you really understand how things work under the hood. And you can apply this to everything. Knowing how things work under the hood gives you superpowers as a developer—and that's what I love most about development.
            </p>
            <br />
            {/* Social Links */}
            <div className="flex flex-wrap gap-4">
              <a
                href="https://github.com/shaxb"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-gray-800 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Github size={20} />
                <span className="font-medium">GitHub</span>
              </a>
              <a
                href="https://t.me/ShaxbozAbduxalilov"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Send size={20} />
                <span className="font-medium">Telegram</span>
              </a>
            </div>
          </div>
        </div>

        {/* Features Highlights */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 dark:from-purple-700 dark:via-blue-700 dark:to-cyan-700 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-6 text-center">Key Features</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-bold mb-2">AI-Powered Roadmaps</h3>
              <p className="text-purple-100 text-sm">Personalized learning paths generated by GPT-4</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="font-bold mb-2">Gamification</h3>
              <p className="text-purple-100 text-sm">XP points, levels, and achievements</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="font-bold mb-2">Leaderboards</h3>
              <p className="text-purple-100 text-sm">Compete with learners worldwide</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🧠</div>
              <h3 className="font-bold mb-2">Smart Quizzes</h3>
              <p className="text-purple-100 text-sm">AI-generated questions tailored to your level</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🌙</div>
              <h3 className="font-bold mb-2">Dark Mode</h3>
              <p className="text-purple-100 text-sm">Beautiful design in light and dark themes</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">📱</div>
              <h3 className="font-bold mb-2">Mobile Ready</h3>
              <p className="text-purple-100 text-sm">Fully responsive on all devices</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 font-semibold text-lg transform hover:scale-105"
          >
            Start Your Quest Today
            <Rocket size={20} />
          </Link>
        </div>
      </main>
    </div>
  );
}
