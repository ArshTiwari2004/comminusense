"use client"

import Sidebar from "@/components/layout/sidebar"
import Topbar from "@/components/layout/topbar"
import { RequireAuth } from "@/hooks/use-auth"

export default function ReportsPage() {
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
  function exportCsv() {
    const rows = [
      ["timestamp", "power_kw", "load_tph", "kwh_per_ton"],
      [new Date().toISOString(), 120.5, 55.2, (120.5 / 55.2).toFixed(2)],
    ]
    const csv = rows.map((r) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "energy_report.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="p-4 space-y-4">
      <div className="rounded-lg border border-border bg-[var(--panel)] p-4">
        <div className="text-sm text-muted-foreground mb-2">Reports</div>
        <button
          onClick={exportCsv}
          className="px-3 py-2 rounded-md bg-[var(--brand)] text-[var(--on-brand)] hover:opacity-90 cursor-pointer"
        >
          Export Energy Summary (CSV)
        </button>
      </div>
    </main>
  )
}
