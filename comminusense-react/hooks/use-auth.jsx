"use client"

import { useEffect, useState, useCallback } from "react"
import { auth } from "@/components/auth/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { getUserRoles, setUserRoles, hasPermission } from "@/lib/rbac"

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [roles, setRoles] = useState([])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      if (u?.email) {
        const r = getUserRoles(u.email)
        setRoles(r)
      } else {
        setRoles([])
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const updateRoles = useCallback(
    (email, nextRoles) => {
      setUserRoles(email, nextRoles)
      if (user?.email === email) setRoles(nextRoles)
    },
    [user],
  )

  return { user, roles, loading, hasPermission: (perm) => hasPermission(roles, perm), updateRoles }
}

export function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-dvh grid place-items-center text-muted-foreground">Loading...</div>
  if (!user) {
    if (typeof window !== "undefined") window.location.href = "/login"
    return null
  }
  return children
}
