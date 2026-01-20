"use client"

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log('ThemeToggle mounted, document class:', document.documentElement.className);
  }, []);

  useEffect(() => {
    console.log('Theme changed to:', theme, 'document class:', document.documentElement.className);
  }, [theme]);

  if (!mounted) return null;

  const isDark = theme === 'dark';

  console.log('Current theme:', theme, 'isDark:', isDark);

  return (
    <button
      onClick={() => {
        const newTheme = isDark ? 'light' : 'dark';
        console.log('Setting theme to:', newTheme);
        setTheme(newTheme);
      }}
      aria-label="Toggle theme"
      className="p-2 rounded-md bg-gray-200 dark:bg-gray-800 text-black dark:text-white hover:opacity-90"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

export default ThemeToggle;
