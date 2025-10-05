"use client"

import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../state/AuthContext.jsx"
import { Lock, LogIn } from "lucide-react"

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mode, setMode] = useState("signin")
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const loc = useLocation()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      if (mode === "signin") await signIn(email, password)
      else await signUp(email, password)
      const to = loc.state?.from?.pathname || "/dashboard"
      navigate(to, { replace: true })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center p-6 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(2,132,199,0.18),transparent)]">
      <div className="w-full max-w-md card p-6">
        <div className="flex items-center gap-2 text-xl font-bold">
          <Lock /> Sign {mode === "signin" ? "in" : "up"}
        </div>
        <p className="mt-1 text-sm text-gray-500">Use demo emails for roles, e.g. operator@example.com</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="label">Email</label>
            <input
              className="input mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              className="input mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button className="btn btn-primary w-full" type="submit">
            <LogIn size={18} /> Continue
          </button>
        </form>
        <div className="mt-4 text-sm text-center">
          {mode === "signin" ? (
            <span>
              No account?{" "}
              <button
                className="text-[rgb(var(--brand-600))] underline cursor-pointer"
                onClick={() => setMode("signup")}
              >
                Sign up
              </button>
            </span>
          ) : (
            <span>
              Have an account?{" "}
              <button
                className="text-[rgb(var(--brand-600))] underline cursor-pointer"
                onClick={() => setMode("signin")}
              >
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
