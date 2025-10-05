"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { auth } from "../lib/firebase.js"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
} from "firebase/auth"

const AuthCtx = createContext(null)

const DEMO_ROLE_MAP = {
  "operator@example.com": "operator",
  "eng@example.com": "engineer",
  "manager@example.com": "manager",
  "admin@example.com": "admin",
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      if (u?.email && DEMO_ROLE_MAP[u.email]) {
        setRole(DEMO_ROLE_MAP[u.email])
      } else {
        setRole("operator") // default role for unknown emails
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const value = useMemo(
    () => ({
      user,
      role,
      loading,
      async signIn(email, password) {
        await signInWithEmailAndPassword(auth, email, password)
      },
      async signUp(email, password) {
        await createUserWithEmailAndPassword(auth, email, password)
      },
      async signOut() {
        await fbSignOut(auth)
      },
    }),
    [user, role, loading],
  )

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
