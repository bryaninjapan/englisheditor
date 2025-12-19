"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, Sparkles, Key, ArrowLeft } from "lucide-react";
import { generateDeviceFingerprint } from "../lib/deviceFingerprint";
import { cn } from "../lib/utils";

export default function ActivatePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleActivate = async () => {
    if (!code.trim()) {
      setError("Please enter an activation code");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const deviceFingerprint = generateDeviceFingerprint();

      const response = await fetch("/api/activate-v2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          deviceFingerprint: deviceFingerprint,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Activation failed");
      }

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    } catch (err: any) {
      console.error("Activation error:", err);
      setError(err.message || "An error occurred during activation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => router.push("/")}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Editor</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Activate Your Account
            </h1>
            <p className="text-gray-600">
              Enter your activation code to get started
            </p>
          </div>

          {success ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Activation Successful!
              </h2>
              <p className="text-gray-600 mb-4">
                Redirecting you to the editor...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activation Code
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => {
                      // 自动格式化：XXXX-XXXX-XXXX-XXXX
                      let value = e.target.value.replace(/[^A-Z0-9]/gi, "").toUpperCase();
                      if (value.length > 16) value = value.substring(0, 16);
                      const formatted = value.match(/.{1,4}/g)?.join("-") || value;
                      setCode(formatted);
                    }}
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    maxLength={19}
                    className={cn(
                      "w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all",
                      error ? "border-red-300" : "border-gray-300"
                    )}
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Activation code adds 100 uses</strong> to your account. You can use multiple activation codes to accumulate more uses.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={20} />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                onClick={handleActivate}
                disabled={isLoading || !code.trim()}
                className={cn(
                  "w-full py-3 px-4 rounded-lg font-semibold text-white shadow-md transition-all flex items-center justify-center gap-2",
                  isLoading || !code.trim()
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:transform active:scale-[0.98]"
                )}
              >
                {isLoading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Activating...
                  </>
                ) : (
                  <>
                    <Key size={18} />
                    Activate
                  </>
                )}
              </button>

              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3">Don't have an activation code?</p>
                <a
                  href="https://your-username.gumroad.com/l/englisheditor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors text-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                  </svg>
                  Purchase on Gumroad
                </a>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Update the link in <code className="bg-gray-100 px-1 rounded">app/lib/config.ts</code> after creating your Gumroad product
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

