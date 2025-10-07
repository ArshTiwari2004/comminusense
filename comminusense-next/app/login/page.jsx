"use client";

import { useState } from "react";
import { signInWithEmail, signInWithGoogle } from "@/components/auth/firebase";
import { LogIn, Mail, KeyRound, Factory } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmail(email, password);
      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      window.location.href = "/";
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:shadow-2xl">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center justify-center gap-2 text-3xl font-bold text-gray-800">
            <span>ComminuSense</span>
          </div>
          <p className="text-sm text-gray-500">
            Smart comminution — lower kWh/ton, better uptime.
          </p>
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-gray-200 my-5"></div>

        {/* Form */}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <div className="mt-1 flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-3 focus-within:border-blue-500">
              <Mail size={16} className="text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent py-2 outline-none text-gray-800"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-3 focus-within:border-blue-500">
              <KeyRound size={16} className="text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent py-2 outline-none text-gray-800"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* or separator */}
        <div className="flex items-center gap-2 my-5">
          <div className="h-[1px] flex-1 bg-gray-200"></div>
          <span className="text-xs text-gray-400 uppercase tracking-wider">
            or
          </span>
          <div className="h-[1px] flex-1 bg-gray-200"></div>
        </div>

        {/* Google button */}
        <button
          onClick={google}
          className="w-full py-2.5 rounded-lg border border-gray-300 bg-white font-medium text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 cursor-pointer "
        >
          <img src="/google.png" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        {/* Footer */}
        <p className="mt-6 text-xs text-center text-gray-400">
          © {new Date().getFullYear()} ComminuSense — All rights reserved.
        </p>
      </div>
    </main>
  );
}
