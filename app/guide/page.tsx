"use client";

import { ArrowLeft, Sparkles, Key, Gift, Users, CheckCircle2, AlertCircle, HelpCircle, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GUMROAD_PRODUCT_URL } from "../lib/config";

export default function GuidePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Sparkles size={18} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">User Guide</h1>
          </div>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Editor
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8">
          {/* Introduction */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="text-blue-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">Welcome to Professional English Editor</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Our AI-powered editor helps you improve your English text with advanced grammar checking, 
              vocabulary enhancement, and professional polishing. This guide will help you get started.
            </p>
          </section>

          {/* Getting Started */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="text-green-600" size={20} />
              Getting Started
            </h3>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Free Trial</h4>
                    <p className="text-sm text-gray-700">
                      Every new user gets <strong>3 free uses</strong> to try our service. No activation code required!
                      Just paste your text and click "Start Polishing".
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Choose Editing Mode</h4>
                    <p className="text-sm text-gray-700 mb-2">
                      Select the mode that best fits your needs:
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                      <li><strong>General Editing:</strong> For everyday text, emails, articles, and general content</li>
                      <li><strong>Legal Professional:</strong> Specialized for legal documents, contracts, and formal legal text</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Paste and Polish</h4>
                    <p className="text-sm text-gray-700">
                      Paste your English text in the input area, then click "Start Polishing". 
                      The AI will analyze your text and provide:
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1 ml-4 mt-2 list-disc">
                      <li>Grammar and syntax corrections</li>
                      <li>Vocabulary improvements</li>
                      <li>Professional tone enhancement</li>
                      <li>A polished final version</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Using Credits System */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Key className="text-orange-600" size={20} />
              How the Credits System Works
            </h3>
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Free Trial (3 Uses)</h4>
                <p className="text-sm text-gray-700 mb-3">
                  All new users automatically receive <strong>3 free uses</strong>. 
                  These are available immediately without any activation.
                </p>
                <div className="bg-white border border-gray-300 rounded p-3">
                  <p className="text-xs text-gray-600">
                    💡 <strong>Tip:</strong> Free trial uses are automatically used first before your purchased credits.
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Key className="text-blue-600" size={16} />
                  Activation Codes (100 Uses Each)
                </h4>
                <p className="text-sm text-gray-700 mb-3">
                  Purchase an activation code to add <strong>100 uses</strong> to your account. 
                  You can use multiple activation codes to accumulate more uses.
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={16} />
                    <span className="text-sm text-gray-700">Activation codes add uses on top of your existing credits</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={16} />
                    <span className="text-sm text-gray-700">No expiration date - use them whenever you need</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={16} />
                    <span className="text-sm text-gray-700">Works on up to 3 different devices</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Gift className="text-purple-600" size={16} />
                  Invite Codes (3 Uses Each)
                </h4>
                <p className="text-sm text-gray-700 mb-3">
                  Invite friends and both you and your friend will receive <strong>3 bonus uses</strong>!
                </p>
                <div className="bg-white/50 border border-purple-200 rounded p-3 space-y-2">
                  <div>
                    <strong className="text-sm text-gray-900">How to invite:</strong>
                    <ol className="text-xs text-gray-700 ml-4 mt-1 space-y-1 list-decimal">
                      <li>Click the "Share" button in the header</li>
                      <li>Copy your unique invite code</li>
                      <li>Share it with your friend</li>
                      <li>When they use it, both of you get 3 uses!</li>
                    </ol>
                  </div>
                  <div className="pt-2 border-t border-purple-200">
                    <strong className="text-sm text-gray-900">How to use an invite code:</strong>
                    <ol className="text-xs text-gray-700 ml-4 mt-1 space-y-1 list-decimal">
                      <li>Click the "Invite" button in the header</li>
                      <li>Enter the invite code your friend shared with you</li>
                      <li>Click "Use Invite Code"</li>
                      <li>Both you and your friend receive 3 uses!</li>
                    </ol>
                  </div>
                </div>
                <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-2">
                  <p className="text-xs text-gray-700">
                    ⚠️ <strong>Note:</strong> Each user can only use one invite code. You cannot use your own invite code.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* How to Activate */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Key className="text-orange-600" size={20} />
              How to Use an Activation Code
            </h3>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Purchase an Activation Code</h4>
                    <p className="text-sm text-gray-700">
                      Buy an activation code from our Gumroad store or get one from your administrator.
                    </p>
                    <Link 
                      href={GUMROAD_PRODUCT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Purchase on Gumroad
                    </Link>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Navigate to Activation Page</h4>
                    <p className="text-sm text-gray-700 mb-2">
                      Click the "Activate" button in the header, or visit the activation page when your free uses run out.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Enter Your Code</h4>
                    <p className="text-sm text-gray-700 mb-2">
                      Enter your activation code in the format: <code className="bg-white px-2 py-1 rounded text-xs font-mono">XXXX-XXXX-XXXX-XXXX</code>
                    </p>
                    <p className="text-sm text-gray-700">
                      The code will automatically format as you type. Click "Activate" to add 100 uses to your account.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Start Using</h4>
                    <p className="text-sm text-gray-700">
                      Once activated, your new credits will be added to your account immediately. 
                      You can continue using the service right away!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Additional Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <BookOpen size={16} className="text-blue-600" />
                  History
                </h4>
                <p className="text-sm text-gray-700">
                  Your last 20 editing sessions are automatically saved. Click the History button to view, 
                  reload, or delete past edits.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-600" />
                  Copy to Clipboard
                </h4>
                <p className="text-sm text-gray-700">
                  Easily copy the polished text to your clipboard with one click. Perfect for pasting into 
                  your documents or emails.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <AlertCircle size={16} className="text-purple-600" />
                  Export to Markdown
                </h4>
                <p className="text-sm text-gray-700">
                  Export your polished text as a Markdown (.md) file. Great for saving your work or 
                  sharing formatted documents.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Users size={16} className="text-orange-600" />
                  Multi-Device Support
                </h4>
                <p className="text-sm text-gray-700">
                  Your credits are tied to your device. You can use the same activation code on up to 
                  3 different devices.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="border-t border-gray-200 pt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <HelpCircle className="text-blue-600" size={20} />
              Frequently Asked Questions
            </h3>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">How many free uses do I get?</h4>
                <p className="text-sm text-gray-700">
                  Every new user gets 3 free uses to try our service. No activation code required!
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Can I use multiple activation codes?</h4>
                <p className="text-sm text-gray-700">
                  Yes! Each activation code adds 100 uses to your account. You can use as many codes as you want 
                  to accumulate more uses.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Can I use my own invite code?</h4>
                <p className="text-sm text-gray-700">
                  No, you cannot use your own invite code. Invite codes are meant to share with friends. 
                  When someone uses your invite code, both of you receive 3 bonus uses.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">How many devices can I use?</h4>
                <p className="text-sm text-gray-700">
                  Each activation code can be used on up to 3 different devices. Your credits are stored 
                  per device, so you'll have separate credit balances on each device.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Do my credits expire?</h4>
                <p className="text-sm text-gray-700">
                  No, your credits never expire. You can use them at any time, at your own pace.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">What's the difference between General and Legal mode?</h4>
                <p className="text-sm text-gray-700">
                  <strong>General Editing</strong> is optimized for everyday text, emails, articles, and general content. 
                  <strong>Legal Professional</strong> mode is specialized for legal documents, using proper legal terminology 
                  and formal language suitable for contracts and legal documents.
                </p>
              </div>
            </div>
          </section>

          {/* Support */}
          <section className="border-t border-gray-200 pt-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-sm text-gray-700 mb-4">
                If you have any questions or encounter any issues, please contact our support team.
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Back to Editor
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

