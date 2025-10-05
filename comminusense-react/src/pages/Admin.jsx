"use client"

import { useState } from "react"
import { users } from "../data/dummy.js"
import { roles } from "../lib/rbac.js"

export default function Admin() {
  const [list, setList] = useState(users)

  function updateRole(id, role) {
    setList((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)))
  }

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="text-sm font-semibold">Users & Roles</div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-[rgb(var(--muted))]">
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Role</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.id} className="border-b border-border">
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.role}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {roles.map((r) => (
                        <button
                          key={r}
                          className={`btn ${r === u.role ? "btn-primary" : "btn-ghost"}`}
                          onClick={() => updateRole(u.id, r)}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          Note: This is demo state in-memory. Integrate with Firestore/DB for persistence.
        </div>
      </div>
    </div>
  )
}
