"use client";
import React, { useState, useEffect } from "react";
import { AppLayout } from "../../src/components/AppLayout";
import { useResearchAgent } from "../../src/hooks";
import { MarkdownRenderer } from "../../src/components/MarkdownRenderer";
import {
  Search,
  Copy,
  Download,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface PersistedResearchResult {
  report: string;
  provider?: "gemini" | "openrouter";
  topic?: string;
}

interface ResearchHistoryItem extends PersistedResearchResult {
  id: string;
  timestamp: string;
}

export default function ResearchAgent() {
  const [topic, setTopic] = useState("");
  const [activeResult, setActiveResult] = useState<PersistedResearchResult | null>(null);
  const [history, setHistory] = useState<ResearchHistoryItem[]>([]);

  const { mutate, isPending, isError, error, reset } = useResearchAgent();

  // Load active state and history on mount
  useEffect(() => {
    const savedActive = localStorage.getItem("techwrite_active_research");
    const savedHistory = localStorage.getItem("techwrite_history_research");

    setTimeout(() => {
      if (savedActive) {
        try {
          const parsed = JSON.parse(savedActive);
          if (parsed.result) {
            setActiveResult(parsed.result);
          }
          if (parsed.topic) {
            setTopic(parsed.topic);
          }
        } catch (e) {
          console.error("Failed to parse saved active research state", e);
        }
      }

      if (savedHistory) {
        try {
          setHistory(JSON.parse(savedHistory));
        } catch (e) {
          console.error("Failed to parse saved research history", e);
        }
      }
    }, 0);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || topic.trim().length < 2) {
      toast.warning("Please enter a research topic first.");
      return;
    }

    mutate(topic, {
      onSuccess: (res) => {
        const newResult: PersistedResearchResult = {
          report: res.report,
          provider: res.provider,
          topic,
        };
        setActiveResult(newResult);
        localStorage.setItem(
          "techwrite_active_research",
          JSON.stringify({ result: newResult, topic })
        );

        // Add item to history
        const newHistoryItem: ResearchHistoryItem = {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleString(),
          ...newResult,
        };
        const updatedHistory = [newHistoryItem, ...history];
        setHistory(updatedHistory);
        localStorage.setItem(
          "techwrite_history_research",
          JSON.stringify(updatedHistory)
        );
      },
    });
  };

  const handleReset = () => {
    setTopic("");
    setActiveResult(null);
    localStorage.removeItem("techwrite_active_research");
    reset();
    toast.info("Workspace reset.");
  };

  const loadHistoryItem = (item: ResearchHistoryItem) => {
    const loadedResult: PersistedResearchResult = {
      report: item.report,
      provider: item.provider,
      topic: item.topic,
    };
    setActiveResult(loadedResult);
    setTopic(item.topic || "");

    // Sync active item back to localstorage
    localStorage.setItem(
      "techwrite_active_research",
      JSON.stringify({ result: loadedResult, topic: item.topic })
    );
    toast.success(`Loaded research for "${item.topic}" from history.`);
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedHistory = history.filter((item) => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem(
      "techwrite_history_research",
      JSON.stringify(updatedHistory)
    );
    toast.success("History item deleted.");
  };

  const copyToClipboard = () => {
    if (activeResult?.report) {
      navigator.clipboard.writeText(activeResult.report);
      toast.success("Research report copied to clipboard.");
    }
  };

  const downloadReport = () => {
    if (activeResult?.report) {
      const element = document.createElement("a");
      const fileBlob = new Blob([activeResult.report], { type: "text/plain" });
      element.href = URL.createObjectURL(fileBlob);
      const filename =
        (topic || "research").toLowerCase().replace(/[^a-z0-9]+/g, "_") || "research_report";
      element.download = `${filename}.md`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success("Research report downloaded.");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header Block */}
        <section className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Research Agent
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            Submit a subject keyword or concept topic. Our DeepSeek agent compiles a structured markdown research dossier.
          </p>
        </section>

        {/* Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter a topic (e.g., Quantum Computing, Rust Memory Safety)..."
                className="w-full h-12 pl-11 pr-4 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder-zinc-400 font-sans"
              />
            </div>
            <div className="flex gap-2">
              {(topic.trim().length > 0 || activeResult) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="h-12 px-4 inline-flex items-center justify-center border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-sm font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                disabled={isPending || topic.trim().length < 2}
                className="h-12 px-6 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 dark:bg-indigo-500 font-semibold text-sm text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs shadow-indigo-600/10 cursor-pointer shrink-0"
              >
                {isPending ? "Conducting Research..." : "Generate Report"}
              </button>
            </div>
          </div>
        </form>

        {/* Results Workspace */}
        <div className="space-y-6">
          {!activeResult && !isPending && !isError && (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 min-h-[250px] space-y-4 shadow-xs">
              <div className="p-4 rounded-full bg-zinc-50 dark:bg-zinc-900 text-zinc-400">
                <HelpCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-zinc-950 dark:text-white">
                  Workspace Idle
                </h4>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
                  Enter a research topic in the query bar above to direct the DeepSeek agent.
                </p>
              </div>
            </div>
          )}

          {isPending && (
            <div className="p-6 sm:p-8 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-6 min-h-[300px] animate-pulse shadow-xs">
              <div className="h-8 w-2/5 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
              <div className="space-y-3">
                <div className="h-4 w-1/4 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-900 rounded-md" />
                  <div className="h-4 w-11/12 bg-zinc-100 dark:bg-zinc-900 rounded-md" />
                  <div className="h-4 w-5/6 bg-zinc-100 dark:bg-zinc-900 rounded-md" />
                </div>
              </div>
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-red-200/60 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/10 min-h-[250px] space-y-4">
              <AlertTriangle className="w-10 h-10 text-red-500" />
              <div className="space-y-2">
                <h4 className="font-bold text-red-950 dark:text-red-300">
                  Research Interrupted
                </h4>
                <p className="text-sm text-red-600/90 dark:text-red-400/90 max-w-md">
                  {error instanceof Error ? error.message : "AI service temporarily unavailable."}
                </p>
              </div>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-red-200 dark:border-red-900/40 rounded-xl text-xs font-semibold text-red-700 dark:text-red-400 bg-white dark:bg-zinc-950 hover:bg-red-50/55 dark:hover:bg-red-950/20 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Workspace
              </button>
            </div>
          )}

          {activeResult && !isPending && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Research Dossier Compiled
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Report
                  </button>
                  <button
                    onClick={downloadReport}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950 rounded-lg text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download MD
                  </button>
                </div>
              </div>

              {activeResult.provider && (
                <div className="flex justify-end">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    activeResult.provider === "gemini"
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30"
                      : "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400 border border-violet-100 dark:border-violet-900/30"
                  }`}>
                    {activeResult.provider === "gemini" ? "🟢 Powered by Gemini" : "🟣 Powered by OpenRouter"}
                  </span>
                </div>
              )}

              {/* Markdown Display Card */}
              <div className="p-6 sm:p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs max-w-none">
                <MarkdownRenderer content={activeResult.report} />
              </div>
            </div>
          )}
        </div>

        {/* History Log */}
        {history.length > 0 && (
          <section className="p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-4 shadow-xs">
            <h3 className="font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <span className="text-zinc-500">📋</span> Previous Research Reports
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => loadHistoryItem(item)}
                  className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30 cursor-pointer transition-all flex justify-between items-start gap-4"
                >
                  <div className="space-y-1 overflow-hidden flex-1">
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                      {item.topic}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                      <span>{item.timestamp}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {item.provider && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        item.provider === "gemini"
                          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400"
                          : "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400"
                      }`}>
                        {item.provider === "gemini" ? "🟢 Gemini" : "🟣 OpenRouter"}
                      </span>
                    )}
                    <button
                      onClick={(e) => deleteHistoryItem(item.id, e)}
                      className="p-1 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  );
}
