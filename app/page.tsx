"use client";

import { useState, useEffect } from "react";
import { Settings, Eraser, CheckCircle2, AlertCircle, Sparkles, Scale, Type, ChevronDown, Copy, FileText, Check, History, X, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PROMPT_GENERAL, PROMPT_LEGAL } from "./lib/prompts";
import { cn } from "./lib/utils";

type ModelType = "gpt-4o" | "gpt-4o-mini" | "gemini-3-pro-preview" | "gemini-2.5-pro" | "gemini-2.5-flash" | "gemini-2.0-flash-exp" | "gemini-1.5-flash" | "gemini-1.5-pro";

interface HistoryRecord {
  id: string;
  input: string;
  output: string;
  mode: "general" | "legal";
  model: ModelType;
  timestamp: number;
}

const MODELS: { id: ModelType; name: string; provider: "openai" | "google" }[] = [
  { id: "gemini-3-pro-preview", name: "Gemini 3 Pro (Preview)", provider: "google" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "google" },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "google" },
  { id: "gemini-2.0-flash-exp", name: "Gemini 2.0 Flash (Exp)", provider: "google" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "google" },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", provider: "google" },
  { id: "gpt-4o", name: "GPT-4o", provider: "openai" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai" },
];

export default function Home() {
  // State
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Model & Key State
  const [selectedModel, setSelectedModel] = useState<ModelType>("gemini-3-pro-preview");
  const [openaiKey, setOpenaiKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [tempOpenaiKey, setTempOpenaiKey] = useState("");
  const [tempGeminiKey, setTempGeminiKey] = useState("");
  
  const [showSettings, setShowSettings] = useState(false);
  const [mode, setMode] = useState<"general" | "legal">("general");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load API Keys and History from localStorage on mount
  useEffect(() => {
    const storedOpenaiKey = localStorage.getItem("openai_api_key");
    const storedGeminiKey = localStorage.getItem("gemini_api_key");
    if (storedOpenaiKey) {
      setOpenaiKey(storedOpenaiKey);
      setTempOpenaiKey(storedOpenaiKey);
    }
    if (storedGeminiKey) {
      setGeminiKey(storedGeminiKey);
      setTempGeminiKey(storedGeminiKey);
    }

    // Load history
    const storedHistory = localStorage.getItem("editor_history");
    if (storedHistory) {
      try {
        const parsed = JSON.parse(storedHistory) as HistoryRecord[];
        setHistory(parsed);
      } catch (err) {
        console.error("Failed to parse history:", err);
      }
    }
  }, []);

  // Save API Keys
  const handleSaveKeys = () => {
    if (tempOpenaiKey.trim()) {
      localStorage.setItem("openai_api_key", tempOpenaiKey.trim());
      setOpenaiKey(tempOpenaiKey.trim());
    } else {
      localStorage.removeItem("openai_api_key");
      setOpenaiKey("");
    }

    if (tempGeminiKey.trim()) {
      localStorage.setItem("gemini_api_key", tempGeminiKey.trim());
      setGeminiKey(tempGeminiKey.trim());
    } else {
      localStorage.removeItem("gemini_api_key");
      setGeminiKey("");
    }

    setShowSettings(false);
    setError("");
  };

  const getActiveKey = () => {
    const provider = MODELS.find((m) => m.id === selectedModel)?.provider;
    return provider === "openai" ? openaiKey : geminiKey;
  };

  // Handle Polishing
  const handlePolishing = async () => {
    const activeKey = getActiveKey();

    if (!activeKey) {
      setShowSettings(true);
      setError(`Please set an API Key for ${MODELS.find((m) => m.id === selectedModel)?.provider === "openai" ? "OpenAI" : "Google Gemini"}.`);
      return;
    }
    if (!text.trim()) {
      alert("Please enter some text to polish.");
      return;
    }

    setIsLoading(true);
    setResult("");
    setError("");

    try {
      const systemPrompt = mode === "legal" ? PROMPT_LEGAL : PROMPT_GENERAL;
      const provider = MODELS.find((m) => m.id === selectedModel)?.provider;

      let content = "";

      if (provider === "google") {
        let modelId = selectedModel;
        // Fix for specific alias behavior if needed, otherwise pass ID directly
        if (selectedModel === "gemini-1.5-flash") modelId = "gemini-1.5-flash-latest";
        if (selectedModel === "gemini-1.5-pro") modelId = "gemini-1.5-pro-latest";
        // Gemini 2.5 and 3 typically use the exact ID provided
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${activeKey}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            },
            contents: [
              {
                parts: [{ text: text }]
              }
            ]
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error?.message || "Failed to fetch response from Google Gemini.");
        }
        const data = await response.json();
        content = data.candidates?.[0]?.content?.parts?.[0]?.text || "No content returned.";

      } else {
        // OpenAI
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${activeKey}`,
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: text },
            ],
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error?.message || "Failed to fetch response from OpenAI.");
        }
        const data = await response.json();
        content = data.choices[0]?.message?.content || "No content returned.";
      }

      setResult(content);

      // Save to history
      const newRecord: HistoryRecord = {
        id: Date.now().toString(),
        input: text,
        output: content,
        mode: mode,
        model: selectedModel,
        timestamp: Date.now(),
      };

      setHistory((prevHistory) => {
        const updatedHistory = [newRecord, ...prevHistory].slice(0, 20); // Keep only latest 20
        localStorage.setItem("editor_history", JSON.stringify(updatedHistory));
        return updatedHistory;
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // Copy to clipboard
  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setError("Failed to copy to clipboard.");
    }
  };

  // Load history record
  const loadHistoryRecord = (record: HistoryRecord) => {
    setText(record.input);
    setResult(record.output);
    setMode(record.mode);
    setSelectedModel(record.model);
    setShowHistory(false);
  };

  // Delete history record
  const deleteHistoryRecord = (id: string) => {
    const updated = history.filter((r) => r.id !== id);
    setHistory(updated);
    localStorage.setItem("editor_history", JSON.stringify(updated));
  };

  // Clear all history
  const clearAllHistory = () => {
    if (confirm("Are you sure you want to clear all history?")) {
      setHistory([]);
      localStorage.removeItem("editor_history");
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Export to Markdown
  const handleExportMarkdown = () => {
    if (!result) return;
    
    // Result is already in Markdown format, save it directly
    const blob = new Blob([result], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `polished-text-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Sparkles size={18} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Professional English Editor</h1>
          </div>
          <div className="flex items-center gap-4">
             {/* Model Selector in Header */}
             <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                <span className="text-gray-400">Model:</span>
                <select 
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value as ModelType)}
                  className="bg-transparent font-medium text-gray-800 outline-none cursor-pointer"
                >
                  {MODELS.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
             </div>

            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors relative"
              title="History"
            >
              <History size={20} />
              {history.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                  {history.length > 9 ? '9+' : history.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors relative"
              title="Settings"
            >
              <Settings size={20} />
              {!getActiveKey() && (
                 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Mode Selector */}
        <div className="mb-6 flex flex-col sm:flex-row justify-center items-center gap-4">
          <div className="bg-gray-100 p-1 rounded-xl inline-flex shadow-inner">
            <button
              onClick={() => setMode("general")}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
                mode === "general"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Type size={16} />
              General Editing
            </button>
            <button
              onClick={() => setMode("legal")}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
                mode === "legal"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Scale size={16} />
              Legal Professional
            </button>
          </div>
          
           {/* Mobile Model Selector */}
           <div className="sm:hidden w-full max-w-xs">
              <select 
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value as ModelType)}
                  className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {MODELS.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:h-[calc(100vh-12rem)]">
          {/* Input Section */}
          <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Input</span>
              {text && (
                <button 
                  onClick={() => setText("")}
                  className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                >
                  <Eraser size={12} /> Clear
                </button>
              )}
            </div>
            <textarea
              className="flex-1 w-full p-4 resize-none outline-none text-gray-800 placeholder:text-gray-300 text-lg leading-relaxed"
              placeholder="Paste your English text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              spellCheck="false"
            />
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={handlePolishing}
                disabled={isLoading}
                className={cn(
                  "w-full py-3 px-4 rounded-xl font-semibold text-white shadow-md transition-all flex items-center justify-center gap-2",
                  !getActiveKey() 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : isLoading
                      ? "bg-blue-400 cursor-wait"
                      : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:transform active:scale-[0.98]"
                )}
              >
                {isLoading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Polishing...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Start Polishing
                  </>
                )}
              </button>
              {!getActiveKey() && (
                <p className="text-xs text-center text-red-500 mt-2">
                  * API Key for {MODELS.find(m => m.id === selectedModel)?.name} required.
                </p>
              )}
            </div>
          </div>

          {/* Output Section */}
          <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Analysis & Result</span>
              <div className="flex items-center gap-2">
                {result && (
                  <>
                    <button
                      onClick={handleCopy}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5",
                        copied
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <>
                          <Check size={14} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Copy
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleExportMarkdown}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                      title="Export as Markdown"
                    >
                      <FileText size={14} />
                      Export MD
                    </button>
                  </>
                )}
                {result && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Completed
                  </span>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-auto p-6 bg-white prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-strong:text-gray-900 prose-a:text-blue-600 prose-table:border-collapse prose-th:bg-gray-50 prose-th:p-3 prose-td:p-3 prose-td:border-t prose-td:border-gray-100">
               {error ? (
                  <div className="flex flex-col items-center justify-center h-full text-red-500 gap-2">
                    <AlertCircle size={32} />
                    <p className="text-center px-4">{error}</p>
                  </div>
               ) : result ? (
                 <ReactMarkdown remarkPlugins={[remarkGfm]}>
                   {result}
                 </ReactMarkdown>
               ) : (
                 <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-4">
                   <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                      <Sparkles size={32} className="opacity-20" />
                   </div>
                   <p>Polished text will appear here</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Settings</h2>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              
              {/* Google Gemini Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Google Gemini API Key</label>
                <input
                  type="password"
                  value={tempGeminiKey}
                  onChange={(e) => setTempGeminiKey(e.target.value)}
                  placeholder="AIza..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              {/* OpenAI Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OpenAI API Key</label>
                <input
                  type="password"
                  value={tempOpenaiKey}
                  onChange={(e) => setTempOpenaiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              {error && (
                 <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2">
                   <AlertCircle size={16} className="mt-0.5 shrink-0" />
                   {error}
                 </div>
              )}

              <button
                onClick={handleSaveKeys}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
              
              <p className="text-xs text-gray-500 text-center">
                Keys are stored locally in your browser. Leave blank to remove.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* History Sidebar */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-end">
          <div className="bg-white w-full sm:w-96 h-[80vh] sm:h-[600px] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <History size={20} className="text-gray-600" />
                <h2 className="text-lg font-bold text-gray-900">History</h2>
                {history.length > 0 && (
                  <span className="text-xs text-gray-500">({history.length}/20)</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {history.length > 0 && (
                  <button
                    onClick={clearAllHistory}
                    className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto p-4">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
                  <History size={48} className="opacity-30" />
                  <p className="text-sm">No history yet</p>
                  <p className="text-xs text-gray-400 text-center px-4">
                    Your editing history will appear here automatically
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((record) => (
                    <div
                      key={record.id}
                      className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group"
                      onClick={() => loadHistoryRecord(record)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn(
                              "text-xs font-medium px-2 py-0.5 rounded",
                              record.mode === "legal" 
                                ? "bg-indigo-100 text-indigo-700" 
                                : "bg-blue-100 text-blue-700"
                            )}>
                              {record.mode === "legal" ? "Legal" : "General"}
                            </span>
                            <span className="text-xs text-gray-500 truncate">
                              {MODELS.find(m => m.id === record.model)?.name || record.model}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock size={12} />
                            {formatTimestamp(record.timestamp)}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteHistoryRecord(record.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2 mt-2">
                        {record.input.substring(0, 100)}
                        {record.input.length > 100 ? "..." : ""}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {record.output.substring(0, 80)}
                        {record.output.length > 80 ? "..." : ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
