"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import ThemeToggle from '@/components/ThemeToggle';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const { logout } = useUser();

  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">QuestPath</h1>
            <div className="hidden md:flex space-x-4">
              <Link 
                href="/dashboard" 
                className={`px-3 py-2 rounded-md transition-all ${
                  isActive('/dashboard')
                    ? 'text-purple-700 font-semibold bg-purple-50 dark:text-purple-300 dark:bg-purple-900/30'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-purple-400 dark:hover:bg-gray-800'
                }`}
              >
                Dashboard
              </Link>
              <Link 
                href="/leaderboard" 
                className={`px-3 py-2 rounded-md transition-all ${
                  isActive('/leaderboard')
                    ? 'text-purple-700 font-semibold bg-purple-50 dark:text-purple-300 dark:bg-purple-900/30'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-purple-400 dark:hover:bg-gray-800'
                }`}
              >
                Leaderboard
              </Link>
              <Link 
                href="/pricing" 
                className={`px-3 py-2 rounded-md transition-all ${
                  isActive('/pricing')
                    ? 'text-purple-700 font-semibold bg-purple-50 dark:text-purple-300 dark:bg-purple-900/30'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-purple-400 dark:hover:bg-gray-800'
                }`}
              >
                Pricing
              </Link>
              <Link 
                href="/about" 
                className={`px-3 py-2 rounded-md transition-all ${
                  isActive('/about')
                    ? 'text-purple-700 font-semibold bg-purple-50 dark:text-purple-300 dark:bg-purple-900/30'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-purple-400 dark:hover:bg-gray-800'
                }`}
              >
                About
              </Link>
              <Link 
                href="/profile" 
                className={`px-3 py-2 rounded-md transition-all ${
                  isActive('/profile')
                    ? 'text-purple-700 font-semibold bg-purple-50 dark:text-purple-300 dark:bg-purple-900/30'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-purple-400 dark:hover:bg-gray-800'
                }`}
              >
                Profile
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
              {/* <ThemeToggle /> */}
              <button
                onClick={logout}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 px-3 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>

            <div className="md:hidden relative">
              <button
                onClick={() => setMobileOpen((s) => !s)}
                aria-label="Toggle menu"
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              {mobileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 p-2">
                  <nav className="flex flex-col">
                    <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Dashboard</Link>
                    <Link href="/leaderboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Leaderboard</Link>
                    <Link href="/pricing" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Pricing</Link>
                    <Link href="/about" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">About</Link>
                    <Link href="/profile" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Profile</Link>

                    {/* <div className="mt-2 px-2">
                      <ThemeToggle />
                    </div> */}

                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        logout();
                      }}
                      className="mt-2 w-full text-left px-3 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center gap-2">
                        <LogOut size={16} />
                        <span>Logout</span>
                      </div>
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
