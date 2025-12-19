"use client";

import { useState, useEffect } from "react";
import { 
  Plus, List, BarChart3, Key, CheckCircle2, XCircle, Clock, 
  Copy, Check, AlertCircle, Trash2, Search, Filter, Download
} from "lucide-react";
import { cn } from "../lib/utils";

interface ActivationCode {
  id: number;
  code: string;
  type: string;
  status: string;
  max_uses: number;
  current_uses: number;
  expires_at: number | null;
  created_at: number;
  created_by: string | null;
  metadata: any;
  deviceCount: number;
}

interface Stats {
  totalCodes: number;
  totalDevices: number;
  activeDevices: number;
  usedCodes: number;
  recentActivations: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  devicesByType: Record<string, number>;
}

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<"generate" | "list" | "stats">("generate");
  const [codes, setCodes] = useState<ActivationCode[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Generate form state
  const [generateForm, setGenerateForm] = useState({
    type: "purchase",
    maxUses: 1,
    expiresDays: "",
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

  useEffect(() => {
    // Check if token is stored
    const stored = localStorage.getItem("admin_token");
    if (stored) {
      setToken(stored);
      setIsAuthenticated(true);
      if (activeTab === "stats") {
        loadStats();
      } else if (activeTab === "list") {
        loadCodes();
      }
    }
  }, []);

  const handleLogin = () => {
    if (!token.trim()) {
      alert("Please enter admin token");
      return;
    }
    localStorage.setItem("admin_token", token);
    setIsAuthenticated(true);
    if (activeTab === "stats") {
      loadStats();
    } else if (activeTab === "list") {
      loadCodes();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setToken("");
    setIsAuthenticated(false);
    setCodes([]);
    setStats(null);
    setGeneratedCodes([]);
  };

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      } else {
        alert(data.error || "Failed to load stats");
      }
    } catch (err: any) {
      alert("Error loading stats: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCodes = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (listFilters.status) params.append("status", listFilters.status);
      if (listFilters.type) params.append("type", listFilters.type);
      if (listFilters.search) params.append("search", listFilters.search);
      params.append("page", listFilters.page.toString());
      params.append("limit", listFilters.limit.toString());

      const response = await fetch(`/admin/list?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setCodes(data.codes);
      } else {
        alert(data.error || "Failed to load codes");
      }
    } catch (err: any) {
      alert("Error loading codes: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/admin/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: generateForm.type,
          maxUses: generateForm.maxUses,
          expiresDays: generateForm.expiresDays ? parseInt(generateForm.expiresDays) : null,
          count: generateForm.count,
          metadata: generateForm.metadata ? JSON.parse(generateForm.metadata) : null,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setGeneratedCodes(data.codes);
        setGenerateForm({ ...generateForm, count: 1 });
        alert(`Successfully generated ${data.codes.length} activation code(s)!`);
      } else {
        alert(data.error || "Failed to generate codes");
      }
    } catch (err: any) {
      alert("Error generating codes: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "Never";
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <Key className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
            <p className="text-gray-600 mt-2">Enter admin token to continue</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Token
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Enter admin token"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => {
                  setActiveTab("generate");
                  setGeneratedCodes([]);
                }}
                className={cn(
                  "px-6 py-4 text-sm font-medium border-b-2 transition-colors",
                  activeTab === "generate"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Generate Codes
              </button>
              <button
                onClick={() => {
                  setActiveTab("list");
                  loadCodes();
                }}
                className={cn(
                  "px-6 py-4 text-sm font-medium border-b-2 transition-colors",
                  activeTab === "list"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <List className="w-4 h-4 inline mr-2" />
                Code List
              </button>
              <button
                onClick={() => {
                  setActiveTab("stats");
                  loadStats();
                }}
                className={cn(
                  "px-6 py-4 text-sm font-medium border-b-2 transition-colors",
                  activeTab === "stats"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                Statistics
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === "generate" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Generate Activation Codes</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={generateForm.type}
                    onChange={(e) => setGenerateForm({ ...generateForm, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="purchase">Purchase</option>
                    <option value="invite">Invite</option>
                    <option value="trial">Trial</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Uses
                  </label>
                  <input
                    type="number"
                    value={generateForm.maxUses}
                    onChange={(e) => setGenerateForm({ ...generateForm, maxUses: parseInt(e.target.value) || 1 })}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expires (Days, optional)
                  </label>
                  <input
                    type="number"
                    value={generateForm.expiresDays}
                    onChange={(e) => setGenerateForm({ ...generateForm, expiresDays: e.target.value })}
                    placeholder="Leave empty for no expiration"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Count
                  </label>
                  <input
                    type="number"
                    value={generateForm.count}
                    onChange={(e) => setGenerateForm({ ...generateForm, count: parseInt(e.target.value) || 1 })}
                    min="1"
                    max="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metadata (JSON, optional)
                </label>
                <textarea
                  value={generateForm.metadata}
                  onChange={(e) => setGenerateForm({ ...generateForm, metadata: e.target.value })}
                  placeholder='{"gumroad_order_id": "12345"}'
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className={cn(
                  "px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Generate Codes
                  </>
                )}
              </button>

              {generatedCodes.length > 0 && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-3">
                    Generated {generatedCodes.length} code(s):
                  </h3>
                  <div className="space-y-2">
                    {generatedCodes.map((code) => (
                      <div
                        key={code}
                        className="flex items-center justify-between p-2 bg-white rounded border border-green-200"
                      >
                        <code className="font-mono text-sm">{code}</code>
                        <button
                          onClick={() => copyToClipboard(code)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          {copiedCode === code ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
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
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Activation Codes</h2>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search codes..."
                    value={listFilters.search}
                    onChange={(e) => setListFilters({ ...listFilters, search: e.target.value, page: 1 })}
                    onKeyPress={(e) => e.key === "Enter" && loadCodes()}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <select
                    value={listFilters.status}
                    onChange={(e) => setListFilters({ ...listFilters, status: e.target.value, page: 1 })}
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
                    onChange={(e) => setListFilters({ ...listFilters, type: e.target.value, page: 1 })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="">All Types</option>
                    <option value="purchase">Purchase</option>
                    <option value="invite">Invite</option>
                    <option value="trial">Trial</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    onClick={loadCodes}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Search size={16} />
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : codes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No codes found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uses</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Devices</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {codes.map((code) => (
                        <tr key={code.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <code className="text-sm font-mono">{code.code}</code>
                            <button
                              onClick={() => copyToClipboard(code.code)}
                              className="ml-2 text-gray-400 hover:text-gray-600"
                            >
                              {copiedCode === code.code ? (
                                <Check className="w-3 h-3 text-green-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                              {code.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span
                              className={cn(
                                "px-2 py-1 rounded text-xs",
                                code.status === "active" && "bg-green-100 text-green-700",
                                code.status === "used" && "bg-gray-100 text-gray-700",
                                code.status === "expired" && "bg-red-100 text-red-700",
                                code.status === "revoked" && "bg-orange-100 text-orange-700"
                              )}
                            >
                              {code.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {code.current_uses} / {code.max_uses}
                          </td>
                          <td className="px-4 py-3 text-sm">{code.deviceCount}</td>
                          <td className="px-4 py-3 text-sm">{formatDate(code.expires_at)}</td>
                          <td className="px-4 py-3 text-sm">{formatTimestamp(code.created_at)}</td>
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
              <h2 className="text-xl font-semibold text-gray-900">Statistics</h2>
              
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalCodes}</div>
                    <div className="text-sm text-gray-600">Total Codes</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.totalDevices}</div>
                    <div className="text-sm text-gray-600">Total Devices</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{stats.activeDevices}</div>
                    <div className="text-sm text-gray-600">Active Devices (7d)</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{stats.recentActivations}</div>
                    <div className="text-sm text-gray-600">Recent (30d)</div>
                  </div>

                  <div className="md:col-span-2 bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="font-semibold mb-3">By Status</h3>
                    <div className="space-y-2">
                      {Object.entries(stats.byStatus).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 capitalize">{status}</span>
                          <span className="font-semibold">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2 bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="font-semibold mb-3">By Type</h3>
                    <div className="space-y-2">
                      {Object.entries(stats.byType).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 capitalize">{type}</span>
                          <span className="font-semibold">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

