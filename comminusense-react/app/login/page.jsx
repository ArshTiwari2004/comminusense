"use client"

import { useState } from "react"
import { signInWithEmail, signInWithGoogle } from "@/components/auth/firebase"
import { LogIn, Mail, KeyRound } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await signInWithEmail(email, password)
      window.location.href = "/"
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function google() {
    setLoading(true)
    setError(null)
    try {
      await signInWithGoogle()
      window.location.href = "/"
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-dvh grid place-items-center bg-[linear-gradient(180deg,#0b1220,rgba(13,24,45,0.9))]">
      <div className="w-full max-w-md rounded-xl border border-border bg-[var(--panel)] p-6">
        <div className="flex items-center gap-2 text-2xl font-semibold">
          <LogIn size={20} />
          <span>Sign in to ComminuSense</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Smart comminution — lower kWh/ton, better uptime</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Email</label>
            <div className="mt-1 flex items-center gap-2 rounded-md border border-border bg-background px-3">
              <Mail size={16} className="text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent py-2 outline-none"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Password</label>
            <div className="mt-1 flex items-center gap-2 rounded-md border border-border bg-background px-3">
              <KeyRound size={16} className="text-muted-foreground" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent py-2 outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <div className="text-sm text-[var(--destructive)]">{error}</div>}

          <button
            disabled={loading}
            className="w-full py-2 rounded-md bg-[var(--brand)] text-[var(--on-brand)] hover:opacity-90 cursor-pointer"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-4">
          <button
            onClick={google}
            className="w-full py-2 rounded-md border border-border hover:bg-[var(--muted)] cursor-pointer"
          >
            Continue with Google
          </button>
        </div>
      </div>
    </main>
  )
}
