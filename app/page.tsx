"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "../src/components/AppLayout";
import {
  FileText,
  FileCheck,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Award,
} from "lucide-react";

export default function Home() {
  const [stats, setStats] = useState({
    documents: 0,
    summaries: 0,
    reports: 0,
  });

  const loadStats = () => {
    if (typeof window !== "undefined") {
      setStats({
        documents: Number(localStorage.getItem("stats_documents") || 0),
        summaries: Number(localStorage.getItem("stats_summaries") || 0),
        reports: Number(localStorage.getItem("stats_reports") || 0),
      });
    }
  };

  useEffect(() => {
    const handleStatsLoad = () => {
      setTimeout(() => {
        loadStats();
      }, 0);
    };
    handleStatsLoad();
    window.addEventListener("storage_stats_updated", handleStatsLoad);
    return () => {
      window.removeEventListener("storage_stats_updated", handleStatsLoad);
    };
  }, []);

  const features = [
    {
      name: "Document Assistant",
      description:
        "Extract text from PDF, DOCX, or TXT documents and run advanced grammar check, rewrites, or technical writing improvements.",
      href: "/document-assistant",
      icon: FileText,
      color: "from-blue-600 to-indigo-500",
      darkColor: "dark:from-blue-500/10 dark:to-indigo-500/10",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      name: "Summarization Agent",
      description:
        "Condense lengthy texts into a concise paragraph summary, key points, and list of bullet takeaways automatically.",
      href: "/summarization-agent",
      icon: FileCheck,
      color: "from-emerald-600 to-teal-500",
      darkColor: "dark:from-emerald-500/10 dark:to-teal-500/10",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      name: "Research Agent",
      description:
        "Perform depth researches on any technical subject and generate organized markdown reports covering all essential aspects.",
      href: "/research-agent",
      icon: BookOpen,
      color: "from-violet-600 to-purple-500",
      darkColor: "dark:from-violet-500/10 dark:to-purple-500/10",
      textColor: "text-violet-600 dark:text-violet-400",
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Welcome Banner Card */}
        <section className="relative overflow-hidden rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 sm:p-8 shadow-xs">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 dark:bg-indigo-400/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-500/5 dark:bg-violet-400/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

          <div className="relative max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <Award className="w-3.5 h-3.5" />
              Professional Academic Suite
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
              Elevate Your Technical Writing
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-base sm:text-lg">
              Welcome to the TechWrite AI Agent Suite. Simplify document auditing, condense complex texts, and conduct advanced research powered by cutting-edge Gemini and DeepSeek models.
            </p>
          </div>
        </section>

        {/* Statistics Grid */}
        <section className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="flex items-center justify-between p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs">
            <div className="space-y-1">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Documents Processed
              </span>
              <p className="text-3xl font-bold text-zinc-950 dark:text-white">
                {stats.documents}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          <div className="flex items-center justify-between p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs">
            <div className="space-y-1">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Summaries Generated
              </span>
              <p className="text-3xl font-bold text-zinc-950 dark:text-white">
                {stats.summaries}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <FileCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="flex items-center justify-between p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs">
            <div className="space-y-1">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Research Reports
              </span>
              <p className="text-3xl font-bold text-zinc-950 dark:text-white">
                {stats.reports}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
        </section>

        {/* Feature List Section */}
        <section className="space-y-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-lg text-zinc-950 dark:text-white">
              Launch Writing Agents
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.name}
                  className="group flex flex-col justify-between p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-indigo-500/30 dark:hover:border-indigo-400/30 transition-all duration-200 hover:shadow-xs"
                >
                  <div className="space-y-4">
                    <div
                      className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feat.color} ${feat.darkColor} ${feat.textColor}`}
                    >
                      <Icon className="w-6 h-6 text-white dark:text-current" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-zinc-950 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {feat.name}
                      </h4>
                      <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                        {feat.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6">
                    <Link
                      href={feat.href}
                      className="inline-flex items-center gap-1.5 font-semibold text-sm text-indigo-600 dark:text-indigo-400 group-hover:underline"
                    >
                      Open Workspace
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
