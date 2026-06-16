"use client";
import React, { useState, useEffect } from "react";
import { AppLayout } from "../../src/components/AppLayout";
import { useDocumentAgent } from "../../src/hooks";
import {
  UploadCloud,
  FileCode2,
  Copy,
  Download,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface PersistedDocumentResult {
  originalText: string;
  processedText: string;
  provider?: "gemini" | "openrouter";
  fileName?: string;
}

interface DocumentHistoryItem extends PersistedDocumentResult {
  id: string;
  timestamp: string;
  action: "grammar_check" | "rewrite" | "technical_improve";
}

export default function DocumentAssistant() {
  const [file, setFile] = useState<File | null>(null);
  const [persistedFileName, setPersistedFileName] = useState<string | null>(null);
  const [action, setAction] = useState<
    "grammar_check" | "rewrite" | "technical_improve"
  >("grammar_check");

  const [activeResult, setActiveResult] = useState<PersistedDocumentResult | null>(null);
  const [history, setHistory] = useState<DocumentHistoryItem[]>([]);

  const { mutate, isPending, isError, error, reset } = useDocumentAgent();

  // Load active state and history logs on mount
  useEffect(() => {
    const savedActive = localStorage.getItem("techwrite_active_document");
    const savedHistory = localStorage.getItem("techwrite_history_document");

    setTimeout(() => {
      if (savedActive) {
        try {
          const parsed = JSON.parse(savedActive);
          if (parsed.result) {
            setActiveResult(parsed.result);
          }
          if (parsed.action) {
            setAction(parsed.action);
          }
          if (parsed.fileName) {
            setPersistedFileName(parsed.fileName);
          }
        } catch (e) {
          console.error("Failed to parse saved active document state", e);
        }
      }

      if (savedHistory) {
        try {
          setHistory(JSON.parse(savedHistory));
        } catch (e) {
          console.error("Failed to parse saved document history log", e);
        }
      }
    }, 0);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      const allowedExts = [".pdf", ".docx", ".txt"];
      const ext = selectedFile.name
        .substring(selectedFile.name.lastIndexOf("."))
        .toLowerCase();

      if (allowedExts.includes(ext)) {
        setFile(selectedFile);
        setPersistedFileName(selectedFile.name);
      } else {
        toast.error(
          "Unsupported file extension. Please upload a PDF, DOCX, or TXT file."
        );
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selectedFile = e.dataTransfer.files[0];
      const allowedExts = [".pdf", ".docx", ".txt"];
      const ext = selectedFile.name
        .substring(selectedFile.name.lastIndexOf("."))
        .toLowerCase();

      if (allowedExts.includes(ext)) {
        setFile(selectedFile);
        setPersistedFileName(selectedFile.name);
      } else {
        toast.error(
          "Unsupported file extension. Please upload a PDF, DOCX, or TXT file."
        );
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.warning("Please upload a file first.");
      return;
    }

    mutate(
      { file, action },
      {
        onSuccess: (res) => {
          const newResult: PersistedDocumentResult = {
            originalText: res.originalText,
            processedText: res.processedText,
            provider: res.provider,
            fileName: file.name,
          };
          setActiveResult(newResult);
          localStorage.setItem(
            "techwrite_active_document",
            JSON.stringify({ result: newResult, action, fileName: file.name })
          );

          // Add item to history
          const newHistoryItem: DocumentHistoryItem = {
            id: Date.now().toString(),
            timestamp: new Date().toLocaleString(),
            ...newResult,
            action,
          };
          const updatedHistory = [newHistoryItem, ...history];
          setHistory(updatedHistory);
          localStorage.setItem(
            "techwrite_history_document",
            JSON.stringify(updatedHistory)
          );
        },
      }
    );
  };

  const handleReset = () => {
    setFile(null);
    setPersistedFileName(null);
    setActiveResult(null);
    localStorage.removeItem("techwrite_active_document");
    reset();
    toast.info("Workspace reset.");
  };

  const loadHistoryItem = (item: DocumentHistoryItem) => {
    const loadedResult: PersistedDocumentResult = {
      originalText: item.originalText,
      processedText: item.processedText,
      provider: item.provider,
      fileName: item.fileName,
    };
    setActiveResult(loadedResult);
    setAction(item.action);
    setPersistedFileName(item.fileName || null);

    // Sync active item back to localstorage
    localStorage.setItem(
      "techwrite_active_document",
      JSON.stringify({ result: loadedResult, action: item.action, fileName: item.fileName })
    );
    toast.success(`Loaded "${item.fileName}" from history.`);
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedHistory = history.filter((item) => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem(
      "techwrite_history_document",
      JSON.stringify(updatedHistory)
    );
    toast.success("History item deleted.");
  };

  const copyToClipboard = () => {
    if (activeResult?.processedText) {
      navigator.clipboard.writeText(activeResult.processedText);
      toast.success("Processed text copied to clipboard.");
    }
  };

  const downloadText = () => {
    if (activeResult?.processedText) {
      const element = document.createElement("a");
      const fileBlob = new Blob([activeResult.processedText], { type: "text/plain" });
      element.href = URL.createObjectURL(fileBlob);
      const name = persistedFileName
        ? (persistedFileName.includes(".")
          ? persistedFileName.substring(0, persistedFileName.lastIndexOf("."))
          : persistedFileName)
        : "document";
      element.download = `${name}_processed.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success("Document downloaded successfully.");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header Block */}
        <section className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Document Assistant Agent
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            Upload drafts or technical write-ups to instantly audit grammar, perform professional rewrites, or refine technical prose.
          </p>
        </section>

        {/* Top Section: Horizontal Wide Upload & Configuration Card */}
        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs space-y-6"
        >
          <h3 className="font-bold text-zinc-950 dark:text-white flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-indigo-500" />
            Upload & Configure
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Column 1: Dropzone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                file || persistedFileName
                  ? "border-emerald-500/50 bg-emerald-50/10 dark:bg-emerald-500/5"
                  : "border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-50/55 dark:hover:bg-zinc-900/20"
              }`}
            >
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                accept=".pdf,.docx,.txt"
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center cursor-pointer text-center space-y-3 w-full"
              >
                <UploadCloud
                  className={`w-10 h-10 ${
                    file || persistedFileName ? "text-emerald-500" : "text-zinc-400"
                  }`}
                />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    {file ? file.name : (persistedFileName ? persistedFileName : "Choose a document file")}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    PDF, DOCX, or TXT (Max 10MB)
                  </p>
                </div>
              </label>
            </div>

            {/* Column 2: Actions & Process Trigger */}
            <div className="flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Select Writing Action
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      id: "grammar_check",
                      label: "Grammar Check",
                    },
                    {
                      id: "rewrite",
                      label: "Rewrite",
                    },
                    {
                      id: "technical_improve",
                      label: "Technical Improve",
                    },
                  ].map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => setAction(act.id as "grammar_check" | "rewrite" | "technical_improve")}
                      className={`flex items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        action === act.id
                          ? "border-indigo-600 bg-indigo-50/40 dark:border-indigo-500 dark:bg-indigo-950/20"
                          : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                      }`}
                    >
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        {act.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                {(file || persistedFileName || activeResult) && (
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
                  disabled={isPending || !file}
                  className="flex-1 h-11 inline-flex items-center justify-center rounded-xl bg-indigo-600 dark:bg-indigo-500 font-semibold text-sm text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs shadow-indigo-600/10 cursor-pointer"
                >
                  {isPending ? "Extracting & Processing..." : "Process Document"}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Middle Section: Output Display Panel */}
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
                  Upload a document file on the top panel and select a processing action to begin auditing.
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
                  <div className="h-48 bg-zinc-100 dark:bg-zinc-900 rounded-xl" />
                </div>
                <div className="space-y-3">
                  <div className="h-4 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                  <div className="h-48 bg-zinc-100 dark:bg-zinc-900 rounded-xl" />
                </div>
              </div>
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-red-200/60 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/10 min-h-[250px] space-y-4">
              <AlertTriangle className="w-10 h-10 text-red-500" />
              <div className="space-y-2">
                <h4 className="font-bold text-red-950 dark:text-red-300">
                  Processing Failed
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
                  Audited Output Ready
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
                {/* Original Panel */}
                <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3 shadow-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Original Text
                  </h4>
                  <div className="text-sm text-zinc-700 dark:text-zinc-300 overflow-y-auto max-h-[400px] leading-relaxed whitespace-pre-wrap font-sans bg-zinc-50/50 dark:bg-zinc-900/30 p-4 rounded-xl">
                    {activeResult.originalText}
                  </div>
                </div>

                {/* Processed Panel */}
                <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Processed Result
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
                  <div className="text-sm text-zinc-700 dark:text-zinc-300 overflow-y-auto max-h-[400px] leading-relaxed whitespace-pre-wrap font-sans bg-zinc-50/55 dark:bg-zinc-900/30 p-4 rounded-xl border border-indigo-500/10 dark:border-indigo-400/10">
                    {activeResult.processedText}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* History Log Section */}
        {history.length > 0 && (
          <section className="p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-4 shadow-xs">
            <h3 className="font-bold text-zinc-950 dark:text-white flex items-center gap-2">
              <span className="text-zinc-500">📋</span> Previous Document Audits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => loadHistoryItem(item)}
                  className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30 cursor-pointer transition-all flex justify-between items-start gap-4"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[200px] md:max-w-[280px]">
                      {item.fileName}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="capitalize">{item.action.replace("_", " ")}</span>
                      <span>•</span>
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
