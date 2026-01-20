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
    <nav className="bg-white dark:bg-slate-900 shadow-sm border-b dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">QuestPath</h1>
            <div className="hidden md:flex space-x-4">
              <Link 
                href="/dashboard" 
                className={`px-3 py-2 rounded-md ${
                  isActive('/dashboard')
                    ? 'text-gray-900 font-medium bg-gray-100 dark:text-white dark:bg-gray-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                }`}
              >
                Dashboard
              </Link>
              <Link 
                href="/leaderboard" 
                className={`px-3 py-2 rounded-md ${
                  isActive('/leaderboard')
                    ? 'text-gray-900 font-medium bg-gray-100 dark:text-white dark:bg-gray-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                }`}
              >
                Leaderboard
              </Link>
              <Link 
                href="/pricing" 
                className={`px-3 py-2 rounded-md ${
                  isActive('/pricing')
                    ? 'text-gray-900 font-medium bg-gray-100 dark:text-white dark:bg-gray-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                }`}
              >
                Pricing
              </Link>
              <Link 
                href="/profile" 
                className={`px-3 py-2 rounded-md ${
                  isActive('/profile')
                    ? 'text-gray-900 font-medium bg-gray-100 dark:text-white dark:bg-gray-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
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
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
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
                    <Link href="/profile" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Profile</Link>
                      <Link href="/pricing" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Pricing</Link>

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
