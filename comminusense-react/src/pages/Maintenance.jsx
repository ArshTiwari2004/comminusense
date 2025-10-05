"use client"

import { useMemo, useState } from "react"
import { maintenanceTickets } from "../data/dummy.js"

export default function Maintenance() {
  const [query, setQuery] = useState("")
  const list = useMemo(() => {
    return maintenanceTickets.filter((t) =>
      [t.id, t.asset, t.severity, t.status].join(" ").toLowerCase().includes(query.toLowerCase()),
    )
  }, [query])

  return (
    <div className="space-y-4">
      <div className="card p-4 flex items-center justify-between">
        <div className="text-sm font-semibold">Predictive Tickets</div>
        <input
          className="input w-64"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-[rgb(var(--muted))]">
              <th className="text-left p-3">ID</th>
              <th className="text-left p-3">Asset</th>
              <th className="text-left p-3">Severity</th>
              <th className="text-left p-3">ETA (days)</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Recommendation</th>
            </tr>
          </thead>
          <tbody>
            {list.map((t) => (
              <tr key={t.id} className="border-b border-border">
                <td className="p-3 font-mono">{t.id}</td>
                <td className="p-3">{t.asset}</td>
                <td className="p-3">
                  <span
                    className={`badge ${t.severity === "High" ? "text-white bg-red-600 border-red-600" : t.severity === "Medium" ? "bg-yellow-100 border-yellow-200" : "bg-green-100 border-green-200"}`}
                  >
                    {t.severity}
                  </span>
                </td>
                <td className="p-3">{t.etaDays}</td>
                <td className="p-3">{t.status}</td>
                <td className="p-3">{t.recommendation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
