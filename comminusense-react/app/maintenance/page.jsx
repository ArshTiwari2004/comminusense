"use client"

import Sidebar from "@/components/layout/sidebar"
import Topbar from "@/components/layout/topbar"
import { RequireAuth, useAuth } from "@/hooks/use-auth"
import useSWR from "swr"
import { useState } from "react"

const fetcher = (url, body) => fetch(url, body).then((r) => r.json())

export default function MaintenancePage() {
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
  const { hasPermission } = useAuth()
  const { data, mutate } = useSWR("/api/maintenance/tickets", fetcher)
  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")

  async function create() {
    if (!hasPermission("maintenance.create")) return
    await fetch("/api/maintenance/tickets", {
      method: "POST",
      body: JSON.stringify({ title, description: desc }),
    })
    setTitle("")
    setDesc("")
    mutate()
  }

  return (
    <main className="p-4 space-y-4">
      <div className="rounded-lg border border-border bg-[var(--panel)] p-4">
        <div className="text-sm text-muted-foreground mb-2">Create Maintenance Ticket</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className="px-3 py-2 rounded-md border border-border bg-background outline-none"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="px-3 py-2 rounded-md border border-border bg-background outline-none"
            placeholder="Description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>
        <div className="mt-3">
          <button
            onClick={create}
            className="px-3 py-2 rounded-md bg-[var(--brand)] text-[var(--on-brand)] hover:opacity-90 cursor-pointer"
          >
            Create
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-[var(--panel)] p-4">
        <div className="text-sm text-muted-foreground mb-2">Tickets</div>
        <ul className="space-y-2">
          {data?.tickets?.map((t) => (
            <li key={t.id} className="p-3 rounded-md border border-border flex items-center justify-between">
              <div>
                <div className="font-semibold">{t.title}</div>
                <div className="text-xs text-muted-foreground">{t.description}</div>
              </div>
              <div className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
