"use client";

import React from "react";
import { useTheme } from "../providers";
import { Sun, Moon } from "lucide-react";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:scale-95"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 text-zinc-700 transition-transform duration-200" />
      ) : (
        <Sun className="w-5 h-5 text-amber-500 transition-transform duration-200" />
      )}
    </button>
  );
};

export default ThemeToggle;
