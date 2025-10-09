"use client"

import { useEffect, useState, useCallback } from "react"
import { auth, db } from "@/components/auth/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { getUserRoles, setUserRoles, hasPermission } from "@/lib/rbac"

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [roles, setRoles] = useState([])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u?.email && u?.uid) {
        try {
          // Try to get role from Firestore first
          const userDocRef = doc(db, "users", u.uid)
          const userDocSnap = await getDoc(userDocRef)
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data()
            if (userData.role) {
              const firestoreRoles = [userData.role]
              setRoles(firestoreRoles)
              // Sync with local storage
              setUserRoles(u.email, firestoreRoles)
            } else {
              // Fallback to local storage
              const localRoles = getUserRoles(u.email)
              setRoles(localRoles)
            }
          } else {
            // Fallback to local storage if no Firestore document
            const localRoles = getUserRoles(u.email)
            setRoles(localRoles)
          }
        } catch (error) {
          console.error("Error fetching user role from Firestore:", error)
          // Fallback to local storage on error
          const localRoles = getUserRoles(u.email)
          setRoles(localRoles)
        }
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
