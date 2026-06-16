"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within Providers");
  }
  return context;
};

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");

    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    setTimeout(() => {
      setTheme(initialTheme);
    }, 0);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Prevent hydration flickers by loading theme settings in useEffect
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        {children}
        <Toaster position="top-right" richColors closeButton theme={theme} />
      </ThemeContext.Provider>
    </QueryClientProvider>
  );
};
export default Providers;
