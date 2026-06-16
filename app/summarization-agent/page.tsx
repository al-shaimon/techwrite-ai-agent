"use client";
import React, { useState, useEffect } from "react";
import { AppLayout } from "../../src/components/AppLayout";
import { useSummaryAgent } from "../../src/hooks";
import {
  FileText,
  Sparkles,
  Copy,
  Download,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface PersistedSummaryResult {
  summary: string;
  keyPoints: string[];
  provider?: "gemini" | "openrouter";
  inputText?: string;
}

interface SummaryHistoryItem extends PersistedSummaryResult {
  id: string;
  timestamp: string;
}

export default function SummarizationAgent() {
  const [text, setText] = useState("");
  const [activeResult, setActiveResult] = useState<PersistedSummaryResult | null>(null);
  const [history, setHistory] = useState<SummaryHistoryItem[]>([]);

  const { mutate, isPending, isError, error, reset } = useSummaryAgent();

  const charLimit = 25000;

  // Load active state and history on mount
  useEffect(() => {
    const savedActive = localStorage.getItem("techwrite_active_summary");
    const savedHistory = localStorage.getItem("techwrite_history_summary");

    setTimeout(() => {
      if (savedActive) {
        try {
          const parsed = JSON.parse(savedActive);
          if (parsed.result) {
            setActiveResult(parsed.result);
          }
          if (parsed.text) {
            setText(parsed.text);
          }
        } catch (e) {
          console.error("Failed to parse saved active summary state", e);
        }
      }

      if (savedHistory) {
        try {
          setHistory(JSON.parse(savedHistory));
        } catch (e) {
          console.error("Failed to parse saved summary history", e);
        }
      }
    }, 0);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text || text.trim().length < 10) {
      toast.warning("Please enter at least 10 characters to summarize.");
      return;
    }

    mutate(text, {
      onSuccess: (res) => {
        const newResult: PersistedSummaryResult = {
          summary: res.summary,
          keyPoints: res.keyPoints,
          provider: res.provider,
          inputText: text,
        };
        setActiveResult(newResult);
        localStorage.setItem(
          "techwrite_active_summary",
          JSON.stringify({ result: newResult, text })
        );

        // Add item to history
        const newHistoryItem: SummaryHistoryItem = {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleString(),
          ...newResult,
        };
        const updatedHistory = [newHistoryItem, ...history];
        setHistory(updatedHistory);
        localStorage.setItem(
          "techwrite_history_summary",
          JSON.stringify(updatedHistory)
        );
      },
    });
  };

  const handleReset = () => {
    setText("");
    setActiveResult(null);
    localStorage.removeItem("techwrite_active_summary");
    reset();
    toast.info("Workspace reset.");
  };

  const loadHistoryItem = (item: SummaryHistoryItem) => {
    const loadedResult: PersistedSummaryResult = {
      summary: item.summary,
      keyPoints: item.keyPoints,
      provider: item.provider,
      inputText: item.inputText,
    };
    setActiveResult(loadedResult);
    setText(item.inputText || "");

    // Sync active item back to localstorage
    localStorage.setItem(
      "techwrite_active_summary",
      JSON.stringify({ result: loadedResult, text: item.inputText })
    );
    toast.success("Loaded summary from history.");
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedHistory = history.filter((item) => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem(
      "techwrite_history_summary",
      JSON.stringify(updatedHistory)
    );
    toast.success("History item deleted.");
  };

  const copyToClipboard = () => {
    if (activeResult?.summary) {
      let copyText = `Concise Summary:\n${activeResult.summary}\n\nKey Takeaways:\n`;
      activeResult.keyPoints.forEach((point) => {
        copyText += `- ${point}\n`;
      });
      navigator.clipboard.writeText(copyText);
      toast.success("Summary and takeaways copied to clipboard.");
    }
  };

  const downloadText = () => {
    if (activeResult?.summary) {
      let downloadContent = `=== TECHWRITE SUMMARIZATION RESULT ===\n\n`;
      downloadContent += `CONCISE SUMMARY:\n${activeResult.summary}\n\n`;
      downloadContent += `KEY TAKEAWAYS:\n`;
      activeResult.keyPoints.forEach((point) => {
        downloadContent += `- ${point}\n`;
      });

      const element = document.createElement("a");
      const fileBlob = new Blob([downloadContent], { type: "text/plain" });
      element.href = URL.createObjectURL(fileBlob);
      element.download = "summarization_takeaways.txt";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success("Summary file downloaded.");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header Block */}
        <section className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Summarization Agent
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            Paste long texts, reports, or logs. Our summarizer extracts high-level synopses and essential technical takeaways.
          </p>
        </section>

        {/* Top Section: Full Width Text Workspace Input Panel */}
        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-4 shadow-xs"
        >
          <h3 className="font-bold text-zinc-950 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-500" />
            Text Workspace
          </h3>

          <div className="space-y-2 relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, charLimit))}
              placeholder="Paste technical write-up or article text here (minimum 10 characters)..."
              rows={8}
              className="w-full p-4 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder-zinc-400 font-sans resize-none"
            />
            <div className="flex justify-between items-center text-xs text-zinc-400 dark:text-zinc-500 px-1">
              <span>Min: 10 chars</span>
              <span className={text.length >= charLimit ? "text-amber-500 font-semibold" : ""}>
                {text.length.toLocaleString()} / {charLimit.toLocaleString()} chars
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {(text.trim().length > 0 || activeResult) && (
              <button
                type="button"
                onClick={handleReset}
                className="h-11 px-4 inline-flex items-center justify-center border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-sm font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              disabled={isPending || text.trim().length < 10}
              className="flex-1 h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 dark:bg-indigo-500 font-semibold text-sm text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs shadow-indigo-600/10 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-white" />
              {isPending ? "Analyzing & Summarizing..." : "Generate Summary"}
            </button>
          </div>
        </form>

        {/* Middle Section: Results */}
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
                  Enter the technical text content in the query area above and click summary to run analysis.
                </p>
              </div>
            </div>
          )}

          {isPending && (
            <div className="p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-6 min-h-[300px] animate-pulse">
              <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                  <div className="h-32 bg-zinc-100 dark:bg-zinc-900 rounded-xl" />
                </div>
                <div className="space-y-3">
                  <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                  <div className="h-32 bg-zinc-100 dark:bg-zinc-900 rounded-xl" />
                </div>
              </div>
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-red-200/60 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/10 min-h-[250px] space-y-4">
              <AlertTriangle className="w-10 h-10 text-red-500" />
              <div className="space-y-2">
                <h4 className="font-bold text-red-950 dark:text-red-300">
                  Summarization Failed
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
                  Summary Generated Successfully
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy Result
                  </button>
                  <button
                    onClick={downloadText}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950 rounded-lg text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download TXT
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Summary Card */}
                <div className="p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Concise Summary
                    </h4>
                    {activeResult.provider && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        activeResult.provider === "gemini"
                          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30"
                          : "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400 border border-violet-100 dark:border-violet-900/30"
                      }`}>
                        {activeResult.provider === "gemini" ? "🟢 Powered by Gemini" : "🟣 Powered by OpenRouter"}
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed bg-zinc-50/50 dark:bg-zinc-900/30 p-5 rounded-xl border border-indigo-500/5 dark:border-indigo-400/5 font-sans italic whitespace-pre-wrap">
                    &quot;{activeResult.summary}&quot;
                  </p>
                </div>

                {/* Key Takeaways Card */}
                <div className="p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3 shadow-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Key Takeaways & Points
                  </h4>
                  <ul className="space-y-3 text-zinc-700 dark:text-zinc-300">
                    {activeResult.keyPoints.map((point, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-sm leading-relaxed p-2.5 rounded-xl hover:bg-zinc-50/55 dark:hover:bg-zinc-900/40"
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                          {idx + 1}
                        </span>
                        <span className="mt-0.5">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <section className="p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-4 shadow-xs">
            <h3 className="font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <span className="text-zinc-500">📋</span> Previous Summaries
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
                      {item.summary ? item.summary.substring(0, 100) : "No text context"}...
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
