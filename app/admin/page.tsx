"use client";

import { useState, useEffect } from "react";
import { 
  Plus, List, BarChart3, Key, CheckCircle2, XCircle, Clock, 
  Copy, Check, AlertCircle, Trash2, Search, Filter, Download,
  Shield, Sparkles, TrendingUp, Users, Zap, LogOut, Eye, EyeOff
} from "lucide-react";
import { cn } from "../lib/utils";

interface ActivationCode {
  id: number;
  code: string;
  type: string;
  status: string;
  credits: number;
  used_count: number;
  created_at: number;
  created_by: string | null;
  metadata: any;
  usageCount: number;
  totalCreditsGiven: number;
}

interface Stats {
  totalCodes: number;
  totalUsers: number;
  activeUsers: number;
  totalUsage: number;
  totalCreditsDistributed: number;
  recentActivations: number;
  totalInviteCodes: number;
  usedInviteCodes: number;
  totalInviteUsage: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<"generate" | "list" | "stats">("generate");
  const [codes, setCodes] = useState<ActivationCode[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Generate form state
  const [generateForm, setGenerateForm] = useState({
    type: "paid",
    credits: 100,
    count: 1,
    metadata: "",
  });
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  
  // List filters
  const [listFilters, setListFilters] = useState({
    page: 1,
    limit: 50,
    status: "",
    type: "",
    search: "",
  });

  // Toast notification system
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  useEffect(() => {
    // Check if token is stored and verify it
    const stored = localStorage.getItem("admin_token");
    if (stored) {
      setToken(stored);
      // Verify token on mount
      verifyToken(stored);
    }
  }, []);

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await fetch("/admin/stats", {
        headers: {
          Authorization: `Bearer ${tokenToVerify}`,
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid, clear it
          localStorage.removeItem("admin_token");
          setToken("");
          setIsAuthenticated(false);
          return;
        }
        // Other errors, still invalid
        localStorage.removeItem("admin_token");
        setToken("");
        setIsAuthenticated(false);
        return;
      }
      
      const responseText = await response.text();
      try {
        const data = JSON.parse(responseText);
        if (data.success) {
          // Token is valid
          setIsAuthenticated(true);
        } else {
          // Invalid response
          localStorage.removeItem("admin_token");
          setToken("");
          setIsAuthenticated(false);
        }
      } catch (parseError) {
        // Invalid JSON response
        localStorage.removeItem("admin_token");
        setToken("");
        setIsAuthenticated(false);
      }
    } catch (err) {
      // Network error or other issues, clear token
      localStorage.removeItem("admin_token");
      setToken("");
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === "stats") {
        loadStats();
      } else if (activeTab === "list") {
        loadCodes();
      }
    }
  }, [activeTab, isAuthenticated]);

  const handleLogin = async () => {
    const trimmedToken = token.trim();
    if (!trimmedToken) {
      setError("Please enter admin token");
      showToast("Please enter admin token", "error");
      return;
    }
    
    setError(null);
    setIsLoading(true);
    
    try {
      // Verify token by making a test API call
      const response = await fetch("/admin/stats", {
        headers: {
          Authorization: `Bearer ${trimmedToken}`,
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setError("Invalid admin token. Please check your token and try again.");
          showToast("Invalid admin token. Please check your token and try again.", "error");
          setIsLoading(false);
          return;
        }
        const responseText = await response.text();
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      // Token is valid, parse response to ensure it's valid JSON
      const responseText = await response.text();
      try {
        const data = JSON.parse(responseText);
        if (!data.success) {
          throw new Error(data.error || "Authentication failed");
        }
      } catch (parseError: any) {
        throw new Error(`Invalid response from server: ${parseError.message}`);
      }
      
      // Token is valid, store it and authenticate
      localStorage.setItem("admin_token", trimmedToken);
      setToken(trimmedToken);
      setIsAuthenticated(true);
      showToast("Login successful!", "success");
      
      // Load initial data
      if (activeTab === "stats") {
        loadStats();
      } else if (activeTab === "list") {
        loadCodes();
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to verify admin token";
      setError(errorMessage);
      showToast(errorMessage, "error");
      setIsAuthenticated(false);
      localStorage.removeItem("admin_token");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setToken("");
    setIsAuthenticated(false);
    setCodes([]);
    setStats(null);
    setGeneratedCodes([]);
    setError(null);
    showToast("Logged out successfully", "info");
  };

  const getToken = (): string => {
    return token || localStorage.getItem("admin_token") || "";
  };

  const loadStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const currentToken = getToken();
      const response = await fetch("/admin/stats", {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        if (response.status === 401) {
          setError("Unauthorized: Invalid admin token");
          showToast("Unauthorized: Please check your admin token", "error");
          setIsAuthenticated(false);
          localStorage.removeItem("admin_token");
          return;
        }
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError: any) {
        throw new Error(`Invalid response from server: ${parseError.message}`);
      }
      
      if (data.success) {
        setStats(data.stats);
      } else {
        throw new Error(data.error || "Failed to load stats");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to load statistics";
      setError(errorMessage);
      showToast(errorMessage, "error");
      console.error("Load stats error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCodes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (listFilters.status) params.append("status", listFilters.status);
      if (listFilters.type) params.append("type", listFilters.type);
      if (listFilters.search) params.append("search", listFilters.search);
      params.append("page", listFilters.page.toString());
      params.append("limit", listFilters.limit.toString());

      const currentToken = getToken();
      const response = await fetch(`/admin/list?${params}`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        if (response.status === 401) {
          setError("Unauthorized: Invalid admin token");
          showToast("Unauthorized: Please check your admin token", "error");
          setIsAuthenticated(false);
          localStorage.removeItem("admin_token");
          return;
        }
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError: any) {
        throw new Error(`Invalid response from server: ${parseError.message}`);
      }
      
      if (data.success) {
        setCodes(data.codes || []);
      } else {
        throw new Error(data.error || "Failed to load codes");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to load codes";
      setError(errorMessage);
      showToast(errorMessage, "error");
      console.error("Load codes error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (generateForm.count < 1 || generateForm.count > 100) {
      showToast("Count must be between 1 and 100", "error");
      return;
    }
    
    if (generateForm.credits < 1) {
      showToast("Credits must be at least 1", "error");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      let metadataObj = null;
      if (generateForm.metadata.trim()) {
        try {
          metadataObj = JSON.parse(generateForm.metadata);
        } catch (e: any) {
          const errorMsg = e.message || "Invalid JSON";
          showToast(`Invalid JSON in metadata field: ${errorMsg}`, "error");
          setIsLoading(false);
          return;
        }
      }

      const currentToken = getToken();
      const response = await fetch("/admin/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({
          type: generateForm.type,
          credits: generateForm.credits,
          count: generateForm.count,
          metadata: metadataObj,
        }),
      });
      
      // Get response text first to handle both JSON and non-JSON responses
      const responseText = await response.text();
      
      if (!response.ok) {
        if (response.status === 401) {
          setError("Unauthorized: Invalid admin token");
          showToast("Unauthorized: Please check your admin token in Cloudflare Dashboard", "error");
          setIsAuthenticated(false);
          localStorage.removeItem("admin_token");
          return;
        }
        
        // Try to parse error response as JSON
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If not JSON, use the raw text or status message
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      // Parse successful response
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError: any) {
        throw new Error(`Invalid response from server: ${parseError.message}`);
      }
      
      if (data.success) {
        setGeneratedCodes(data.codes || []);
        setGenerateForm({ ...generateForm, count: 1, metadata: "" });
        showToast(`Successfully generated ${data.codes.length} activation code(s)!`, "success");
        // Auto-load codes list
        setTimeout(() => loadCodes(), 1000);
      } else {
        throw new Error(data.error || "Failed to generate codes");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to generate codes";
      setError(errorMessage);
      showToast(errorMessage, "error");
      console.error("Generate error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      showToast("Code copied to clipboard!", "success");
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      showToast("Failed to copy code", "error");
    }
  };

  const copyAllCodes = async () => {
    if (generatedCodes.length === 0) return;
    const codesText = generatedCodes.join('\n');
    try {
      await navigator.clipboard.writeText(codesText);
      showToast("All codes copied to clipboard!", "success");
    } catch (err) {
      showToast("Failed to copy codes", "error");
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-100">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
            <p className="text-gray-600">Enter admin token to continue</p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800">{error}</p>
                <p className="text-xs text-red-600 mt-1">
                  See <code className="bg-red-100 px-1 rounded">RESET_ADMIN_TOKEN.md</code> for help
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Token
              </label>
              <div className="relative">
                <input
                  type={showToken ? "text" : "password"}
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value);
                    setError(null);
                  }}
                  onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="Enter admin token"
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                💡 Token incorrect? See <code className="bg-gray-100 px-1 rounded">RESET_ADMIN_TOKEN.md</code> to reset via Cloudflare Dashboard
              </p>
            </div>
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className={cn(
                "w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              )}
            >
              {isLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                "Login"
              )}
            </button>
          </div>
        </div>
        
        {/* Toast Container */}
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={cn(
                "px-4 py-3 rounded-lg shadow-lg text-white flex items-center gap-2 min-w-[300px] animate-in slide-in-from-right",
                toast.type === "success" && "bg-green-500",
                toast.type === "error" && "bg-red-500",
                toast.type === "info" && "bg-blue-500"
              )}
            >
              {toast.type === "success" && <CheckCircle2 className="w-5 h-5" />}
              {toast.type === "error" && <XCircle className="w-5 h-5" />}
              {toast.type === "info" && <AlertCircle className="w-5 h-5" />}
              <span className="flex-1">{toast.message}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-xs text-gray-500">Activation Code Management</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6 border border-gray-200 overflow-hidden">
          <nav className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab("generate");
                setGeneratedCodes([]);
                setError(null);
              }}
              className={cn(
                "flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2",
                activeTab === "generate"
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              <Plus className="w-4 h-4" />
              Generate Codes
            </button>
            <button
              onClick={() => {
                setActiveTab("list");
                setError(null);
                loadCodes();
              }}
              className={cn(
                "flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2",
                activeTab === "list"
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              <List className="w-4 h-4" />
              Code List
            </button>
            <button
              onClick={() => {
                setActiveTab("stats");
                setError(null);
                loadStats();
              }}
              className={cn(
                "flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2",
                activeTab === "stats"
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              <BarChart3 className="w-4 h-4" />
              Statistics
            </button>
          </nav>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{error}</p>
              {error.includes("Unauthorized") && (
                <p className="text-xs text-red-600 mt-1">
                  Please check your ADMIN_TOKEN in Cloudflare Dashboard → Settings → Environment Variables
                </p>
              )}
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          {activeTab === "generate" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate Activation Codes</h2>
                <p className="text-gray-600">Create new activation codes for your users</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={generateForm.type}
                    onChange={(e) => setGenerateForm({ ...generateForm, type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50"
                    disabled
                  >
                    <option value="paid">Paid Version</option>
                  </select>
                  <p className="mt-2 text-xs text-gray-500">Each activation code grants credits to users</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Credits per Code
                  </label>
                  <input
                    type="number"
                    value={generateForm.credits}
                    onChange={(e) => setGenerateForm({ ...generateForm, credits: Math.max(1, parseInt(e.target.value) || 100) })}
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <p className="mt-2 text-xs text-gray-500">Default: 100 uses per code</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Codes
                  </label>
                  <input
                    type="number"
                    value={generateForm.count}
                    onChange={(e) => setGenerateForm({ ...generateForm, count: Math.max(1, Math.min(100, parseInt(e.target.value) || 1)) })}
                    min="1"
                    max="100"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <p className="mt-2 text-xs text-gray-500">Max: 100 codes at once</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metadata (JSON, optional)
                </label>
                <textarea
                  value={generateForm.metadata}
                  onChange={(e) => setGenerateForm({ ...generateForm, metadata: e.target.value })}
                  placeholder='{"gumroad_order_id": "12345", "note": "Customer purchase"}'
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
                />
                <p className="mt-2 text-xs text-gray-500">Optional metadata in JSON format</p>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isLoading || generateForm.count < 1 || generateForm.credits < 1}
                className={cn(
                  "px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
                )}
              >
                {isLoading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    Generate {generateForm.count} Code{generateForm.count > 1 ? 's' : ''}
                  </>
                )}
              </button>

              {generatedCodes.length > 0 && (
                <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-green-900">
                        ✅ Successfully Generated {generatedCodes.length} Code{generatedCodes.length > 1 ? 's' : ''}
                      </h3>
                      <p className="text-sm text-green-700 mt-1">Copy codes below or use the copy all button</p>
                    </div>
                    <button
                      onClick={copyAllCodes}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copy All
                    </button>
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {generatedCodes.map((code, index) => (
                      <div
                        key={code}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200 hover:border-green-300 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400 font-mono w-8">{index + 1}.</span>
                          <code className="font-mono text-sm font-semibold text-gray-900">{code}</code>
                        </div>
                        <button
                          onClick={() => copyToClipboard(code)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                        >
                          {copiedCode === code ? (
                            <Check className="w-5 h-5 text-green-600" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "list" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Activation Codes</h2>
                  <p className="text-gray-600 text-sm mt-1">View and manage all activation codes</p>
                </div>
                <button
                  onClick={loadCodes}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Search size={16} />
                  Refresh
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="text"
                  placeholder="Search codes..."
                  value={listFilters.search}
                  onChange={(e) => setListFilters({ ...listFilters, search: e.target.value, page: 1 })}
                  onKeyPress={(e) => e.key === "Enter" && loadCodes()}
                  className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <select
                  value={listFilters.status}
                  onChange={(e) => {
                    setListFilters({ ...listFilters, status: e.target.value, page: 1 });
                    loadCodes();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="used">Used</option>
                  <option value="expired">Expired</option>
                  <option value="revoked">Revoked</option>
                </select>
                <select
                  value={listFilters.type}
                  onChange={(e) => {
                    setListFilters({ ...listFilters, type: e.target.value, page: 1 });
                    loadCodes();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">All Types</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-500">Loading codes...</p>
                </div>
              ) : codes.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <List className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No codes found</p>
                  <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Used</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Given</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {codes.map((code) => (
                        <tr key={code.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-mono font-semibold">{code.code}</code>
                              <button
                                onClick={() => copyToClipboard(code.code)}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              >
                                {copiedCode === code.code ? (
                                  <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                              {code.type}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                "px-2 py-1 rounded-md text-xs font-medium",
                                code.status === "active" && "bg-green-100 text-green-700",
                                code.status === "used" && "bg-gray-100 text-gray-700",
                                code.status === "expired" && "bg-red-100 text-red-700",
                                code.status === "revoked" && "bg-orange-100 text-orange-700"
                              )}
                            >
                              {code.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold">{code.credits}</td>
                          <td className="px-4 py-3 text-sm">{code.usageCount || 0}</td>
                          <td className="px-4 py-3 text-sm font-medium text-green-600">{code.totalCreditsGiven || 0}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{formatTimestamp(code.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "stats" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Statistics</h2>
                <p className="text-gray-600">Overview of activation codes and usage</p>
              </div>
              
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-500">Loading statistics...</p>
                </div>
              ) : stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-blue-600">{stats.totalCodes}</div>
                    <div className="text-sm text-gray-600 mt-1">Total Codes</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-green-600">{stats.totalUsers}</div>
                    <div className="text-sm text-gray-600 mt-1">Total Users</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-purple-600">{stats.activeUsers}</div>
                    <div className="text-sm text-gray-600 mt-1">Active Users (7d)</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-orange-600">{stats.totalUsage}</div>
                    <div className="text-sm text-gray-600 mt-1">Total Usage</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200">
                    <div className="text-3xl font-bold text-indigo-600">{stats.totalCreditsDistributed}</div>
                    <div className="text-sm text-gray-600 mt-1">Credits Distributed</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-xl border border-teal-200">
                    <div className="text-3xl font-bold text-teal-600">{stats.totalInviteCodes}</div>
                    <div className="text-sm text-gray-600 mt-1">Invite Codes</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-xl border border-cyan-200">
                    <div className="text-3xl font-bold text-cyan-600">{stats.usedInviteCodes}</div>
                    <div className="text-sm text-gray-600 mt-1">Used Invites</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-xl border border-pink-200">
                    <div className="text-3xl font-bold text-pink-600">{stats.recentActivations}</div>
                    <div className="text-sm text-gray-600 mt-1">Recent Activations (30d)</div>
                  </div>

                  <div className="md:col-span-2 bg-white p-6 rounded-xl border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4">By Status</h3>
                    <div className="space-y-3">
                      {Object.entries(stats.byStatus).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 capitalize">{status}</span>
                          <span className="font-bold text-gray-900">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2 bg-white p-6 rounded-xl border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4">By Type</h3>
                    <div className="space-y-3">
                      {Object.entries(stats.byType).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 capitalize">{type}</span>
                          <span className="font-bold text-gray-900">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No statistics available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "px-4 py-3 rounded-lg shadow-xl text-white flex items-center gap-3 min-w-[320px] max-w-md animate-in slide-in-from-right",
              toast.type === "success" && "bg-green-500",
              toast.type === "error" && "bg-red-500",
              toast.type === "info" && "bg-blue-500"
            )}
          >
            {toast.type === "success" && <CheckCircle2 className="w-5 h-5 shrink-0" />}
            {toast.type === "error" && <XCircle className="w-5 h-5 shrink-0" />}
            {toast.type === "info" && <AlertCircle className="w-5 h-5 shrink-0" />}
            <span className="flex-1 text-sm">{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
