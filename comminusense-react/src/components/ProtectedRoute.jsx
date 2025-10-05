"use client"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../state/AuthContext.jsx"

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const loc = useLocation()
  if (loading) return <div className="p-6">Loading...</div>
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />
  return children
}
