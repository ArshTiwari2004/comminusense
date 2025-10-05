"use client"

import Sidebar from "@/components/layout/sidebar"
import Topbar from "@/components/layout/topbar"
import { RequireAuth, useAuth } from "@/hooks/use-auth"
import { ALL_ROLES, getUserRoles } from "@/lib/rbac"
import { useEffect, useState } from "react"

export default function AdminPage() {
  return (
    <RequireAuth>
      <div className="min-h-dvh bg-background text-foreground flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <Content />
        </div>
      </div>
    </RequireAuth>
  )
}

function Content() {
  const { updateRoles, hasPermission } = useAuth()
  const [email, setEmail] = useState("")
  const [roles, setRoles] = useState([])

  useEffect(() => {
    if (email) setRoles(getUserRoles(email))
  }, [email])

  if (!hasPermission("user.manage")) {
    return <main className="p-4">No access.</main>
  }

  function toggleRole(r) {
    setRoles((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]))
  }

  function save() {
    if (!email) return
    updateRoles(email, roles)
  }

  return (
    <main className="p-4 space-y-4">
      <div className="rounded-lg border border-border bg-[var(--panel)] p-4">
        <div className="text-sm text-muted-foreground mb-2">Assign Roles</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            className="px-3 py-2 rounded-md border border-border bg-background outline-none"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="col-span-2 grid grid-cols-2 md:grid-cols-3 gap-2">
            {ALL_ROLES.map((r) => (
              <button
                key={r}
                onClick={() => toggleRole(r)}
                className={`px-3 py-2 rounded-md border cursor-pointer ${roles.includes(r) ? "bg-[var(--brand)] text-[var(--on-brand)] border-transparent" : "border-border hover:bg-[var(--muted)]"}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3">
          <button
            onClick={save}
            className="px-3 py-2 rounded-md bg-[var(--brand)] text-[var(--on-brand)] hover:opacity-90 cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    </main>
  )
}
