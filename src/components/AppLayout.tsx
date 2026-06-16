"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import {
  LayoutDashboard,
  FileText,
  FileCheck,
  BookOpen,
  Menu,
  X,
  GraduationCap,
} from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Document Assistant", href: "/document-assistant", icon: FileText },
    {
      name: "Summarization Agent",
      href: "/summarization-agent",
      icon: FileCheck,
    },
    { name: "Research Agent", href: "/research-agent", icon: BookOpen },
  ];

  const getPageTitle = () => {
    const active = navigation.find((item) => item.href === pathname);
    return active ? active.name : "TechWrite AI Agent Suite";
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200">
      {/* Global Header */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-4 sm:px-6 shadow-xs">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 sm:hidden focus:outline-none"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline-block font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-violet-500 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              TechWrite Suite
            </span>
          </div>

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

          <h1 className="font-semibold text-zinc-900 dark:text-white text-sm sm:text-base">
            {getPageTitle()}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Fixed Desktop Sidebar */}
        <aside className="hidden sm:flex flex-col w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0">
          <nav className="flex-1 space-y-1.5 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 hover:text-zinc-950 dark:hover:text-zinc-200"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-zinc-400 dark:text-zinc-500"
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 text-center">
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              v1.0.0 • Academic Theme
            </span>
          </div>
        </aside>

        {/* Mobile Sidebar Navigation (Drawer slide-out overlay) */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex sm:hidden">
            {/* Backdrop click dismiss overlay */}
            <div
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            />

            {/* Mobile Drawer Panel */}
            <div className="relative flex flex-col w-72 max-w-xs bg-white dark:bg-zinc-950 h-full border-r border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-extrabold text-lg text-zinc-950 dark:text-white">
                    TechWrite Suite
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-1.5">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 hover:text-zinc-950 dark:hover:text-zinc-200"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          isActive
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-zinc-400 dark:text-zinc-500"
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 text-center">
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  v1.0.0 • Academic Theme
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Global Main Workspace */}
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8 max-w-5xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
