"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eraser, CheckCircle2, AlertCircle, Sparkles, Scale, Type, Copy, FileText, Check, History, X, Clock, Key, Gift, Users, BookOpen } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PROMPT_GENERAL, PROMPT_LEGAL } from "./lib/prompts";
import { generateDeviceFingerprint } from "./lib/deviceFingerprint";
import { initCredits, syncCreditsFromServer, deductLocalCredit, getLocalCredits, type CreditsInfo } from "./lib/credits";
import { cn } from "./lib/utils";

type ModelType = "gemini-3-pro-preview";

interface HistoryRecord {
  id: string;
  input: string;
  output: string;
  mode: "general" | "legal";
  model: ModelType;
  timestamp: number;
}

// 固定使用 Gemini 3 Pro Preview 模型
const DEFAULT_MODEL: ModelType = "gemini-3-pro-preview";

export default function Home() {
  const router = useRouter();
  
  // State
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"general" | "legal">("general");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [credits, setCredits] = useState<CreditsInfo>(initCredits());
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showInviteUseModal, setShowInviteUseModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  
  // Gumroad product URL - 需要替换为你的实际 Gumroad 产品链接
  const GUMROAD_PRODUCT_URL = "https://your-username.gumroad.com/l/englisheditor";

  // Load credits and history on mount
  useEffect(() => {
    loadCredits();
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

  // Load credits from server
  const loadCredits = async () => {
    try {
      const deviceFingerprint = generateDeviceFingerprint();
      const serverCredits = await syncCreditsFromServer(deviceFingerprint);
      if (serverCredits) {
        setCredits(serverCredits);
      } else {
        // 如果同步失败，使用本地缓存
        const local = getLocalCredits();
        if (local) {
          setCredits(local);
        }
      }
    } catch (err) {
      console.error("Failed to load credits:", err);
    }
  };

  // Handle Polishing
  const handlePolishing = async () => {
    if (!text.trim()) {
      alert("Please enter some text to polish.");
      return;
    }

    // Check if user has available credits
    if (credits.totalAvailable <= 0) {
      setError("No credits remaining. Please use an activation code or invite code.");
      return;
    }

    setIsLoading(true);
    setResult("");
    setError("");

    try {
      const systemPrompt = mode === "legal" ? PROMPT_LEGAL : PROMPT_GENERAL;
      const deviceFingerprint = generateDeviceFingerprint();

      // Optimistically deduct credit locally
      const updatedCredits = deductLocalCredit(credits);
      setCredits(updatedCredits);

      // Call Cloudflare Worker API
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          systemPrompt: systemPrompt,
          model: DEFAULT_MODEL,
          deviceFingerprint: deviceFingerprint,
        }),
      });

      if (!response.ok) {
        // If failed, restore the credit
        setCredits(credits);
        
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Request failed with status ${response.status}`;
        
        // If credits error, reload credits from server
        if (errorData.needsActivation || response.status === 403) {
          await loadCredits();
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const content = data.content || "No content returned.";

      // Update credits from server response
      if (data.remainingCredits !== undefined) {
        const serverCredits: CreditsInfo = {
          remainingCredits: data.remainingCredits || 0,
          freeTrialsUsed: data.freeTrialsUsed || 0,
          freeTrialsRemaining: data.freeTrialsRemaining || 0,
          totalAvailable: data.totalAvailable || 0,
        };
        setCredits(serverCredits);
        // Save to localStorage
        const { saveLocalCredits } = await import('./lib/credits');
        saveLocalCredits(serverCredits);
      }

      setResult(content);

      // Save to history
      const newRecord: HistoryRecord = {
        id: Date.now().toString(),
        input: text,
        output: content,
        mode: mode,
        model: DEFAULT_MODEL,
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

  // Generate invite code
  const handleGenerateInvite = async () => {
    try {
      const deviceFingerprint = generateDeviceFingerprint();
      const response = await fetch('/api/invite/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceFingerprint }),
      });

      const data = await response.json();
      if (data.success) {
        setInviteCode(data.inviteCode);
        setShowInviteModal(true);
      } else {
        alert(data.error || 'Failed to generate invite code');
      }
    } catch (err: any) {
      alert('Error generating invite code: ' + err.message);
    }
  };

  // Use invite code
  const handleUseInvite = async () => {
    if (!inviteCode.trim()) {
      alert('Please enter an invite code');
      return;
    }

    try {
      const deviceFingerprint = generateDeviceFingerprint();
      const response = await fetch('/api/invite/use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inviteCode.trim(), deviceFingerprint }),
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message || 'Invite code used successfully!');
        setShowInviteUseModal(false);
        setInviteCode('');
        await loadCredits(); // Reload credits
      } else {
        alert(data.error || 'Failed to use invite code');
      }
    } catch (err: any) {
      alert('Error using invite code: ' + err.message);
    }
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
            {/* Credits Display */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
              <Sparkles className="text-blue-600" size={16} />
              <span className="text-sm font-medium text-blue-700">
                {credits.totalAvailable} uses
              </span>
            </div>

            {/* Invite Button */}
            <button
              onClick={() => setShowInviteUseModal(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              title="Use Invite Code"
            >
              <Gift size={16} />
              <span>Invite</span>
            </button>

            {/* Generate Invite Button */}
            <button
              onClick={handleGenerateInvite}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              title="Generate Invite Code"
            >
              <Users size={16} />
              <span>Share</span>
            </button>

            {/* Purchase Button */}
            <button
              onClick={() => setShowPurchaseModal(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all shadow-md hover:shadow-lg"
              title="Purchase Activation Code"
            >
              <Sparkles size={16} />
              <span>Buy</span>
            </button>

            {/* Activate Button */}
            {credits.totalAvailable === 0 && (
              <button
                onClick={() => router.push("/activate")}
                className="px-3 py-1.5 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors flex items-center gap-2"
              >
                <Key size={16} />
                Activate
              </button>
            )}

            {/* Guide Button */}
            <button
              onClick={() => router.push("/guide")}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              title="User Guide"
            >
              <BookOpen size={20} />
            </button>
            
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
              <div className="space-y-3">
                {/* Credits Info */}
                <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                  <span>Remaining uses:</span>
                  <span className="font-semibold text-blue-600">
                    {credits.totalAvailable} {credits.freeTrialsRemaining > 0 && (
                      <span className="text-green-600">({credits.freeTrialsRemaining} free trial{credits.freeTrialsRemaining > 1 ? 's' : ''})</span>
                    )}
                  </span>
                </div>

                <button
                  onClick={handlePolishing}
                  disabled={isLoading || credits.totalAvailable <= 0}
                  className={cn(
                    "w-full py-3 px-4 rounded-xl font-semibold text-white shadow-md transition-all flex items-center justify-center gap-2",
                    isLoading
                      ? "bg-blue-400 cursor-wait"
                      : credits.totalAvailable <= 0
                      ? "bg-gray-400 cursor-not-allowed"
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

                {credits.totalAvailable === 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="text-yellow-600 mt-0.5 shrink-0" size={16} />
                      <div className="flex-1">
                        <p className="text-sm text-yellow-800 font-medium mb-1">
                          No credits remaining
                        </p>
                        <p className="text-xs text-yellow-700 mb-2">
                          Use an activation code or invite code to continue.
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => router.push("/activate")}
                            className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1"
                          >
                            <Key size={12} />
                            Activate Code
                          </button>
                          <button
                            onClick={() => setShowInviteUseModal(true)}
                            className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1"
                          >
                            <Gift size={12} />
                            Use Invite
                          </button>
                          <button
                            onClick={() => setShowPurchaseModal(true)}
                            className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-3 py-1.5 rounded-md font-medium transition-colors"
                          >
                            Buy on Gumroad
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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

      {/* Invite Code Generate Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Your Invite Code</h2>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteCode("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <code className="text-lg font-mono font-bold text-gray-900 break-all">
                  {inviteCode}
                </code>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Share this code with your friends. When they use it, both of you will receive 3 free uses!
              </p>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(inviteCode);
                    alert("Invite code copied to clipboard!");
                  }}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Copy Code
                </button>
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteCode("");
                  }}
                  className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Code Use Modal */}
      {showInviteUseModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Use Invite Code</h2>
              <button
                onClick={() => {
                  setShowInviteUseModal(false);
                  setInviteCode("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Invite Code
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => {
                    let value = e.target.value.replace(/[^A-Z0-9-]/gi, "").toUpperCase();
                    if (value.length > 15) value = value.substring(0, 15);
                    setInviteCode(value);
                  }}
                  placeholder="XXXX-XXXX-XXXX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                />
                <p className="mt-2 text-xs text-gray-500">
                  You can only use one invite code. Both you and the inviter will receive 3 free uses.
                </p>
              </div>
              <button
                onClick={handleUseInvite}
                disabled={!inviteCode.trim()}
                className={cn(
                  "w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors",
                  !inviteCode.trim()
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700"
                )}
              >
                Use Invite Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-purple-600 to-pink-600">
              <div>
                <h2 className="text-xl font-bold text-white">Purchase Activation Code</h2>
                <p className="text-sm text-white/90 mt-1">Get 100 uses of Professional English Editor</p>
              </div>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Product Info */}
              <div className="mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Sparkles className="text-blue-600" size={18} />
                    What You Get
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={16} />
                      <span><strong>100 uses</strong> of our AI-powered English editor</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={16} />
                      <span>Works with both <strong>General</strong> and <strong>Legal</strong> editing modes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={16} />
                      <span><strong>No expiration date</strong> - use at your own pace</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={16} />
                      <span>Works on <strong>up to 3 devices</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={16} />
                      <span>Instant activation after purchase</span>
                    </li>
                  </ul>
                </div>

                {/* Gumroad Embed */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-4 border-b border-gray-200">
                    <p className="text-sm text-gray-600 text-center">
                      Complete your purchase securely through Gumroad
                    </p>
                  </div>
                  <div className="bg-white p-4">
                    {/* Gumroad Overlay Button */}
                    <a
                      href={GUMROAD_PRODUCT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full"
                      onClick={(e) => {
                        // Open Gumroad in overlay mode
                        e.preventDefault();
                        window.open(
                          `${GUMROAD_PRODUCT_URL}?wanted=true&embed=true`,
                          'gumroad-overlay',
                          'width=600,height=700,scrollbars=yes,resizable=yes'
                        );
                      }}
                    >
                      <button className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2">
                        <Sparkles size={20} />
                        <span>Purchase on Gumroad</span>
                      </button>
                    </a>
                    
                    {/* Alternative: Direct Link */}
                    <div className="mt-4 text-center">
                      <a
                        href={GUMROAD_PRODUCT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-600 hover:text-gray-900 underline"
                      >
                        Or open in new tab
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="text-blue-600" size={16} />
                  After Purchase
                </h4>
                <ol className="text-sm text-gray-700 space-y-1 ml-6 list-decimal">
                  <li>You'll receive an activation code after purchase</li>
                  <li>Visit the <Link href="/activate" className="text-blue-600 hover:underline font-medium">activation page</Link> or click "Activate" in the header</li>
                  <li>Enter your activation code</li>
                  <li>Start using the editor immediately!</li>
                </ol>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                Secure payment processed by Gumroad. Need help? <Link href="/guide" className="text-blue-600 hover:underline">View our guide</Link>
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
                              Gemini 3 Pro
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
