"use client"

import Sidebar from "@/components/layout/sidebar"
import Topbar from "@/components/layout/topbar"
import { RequireAuth, useAuth } from "@/hooks/use-auth"
import useSWR from "swr"
import { useState } from "react"
import LineChart from "@/components/charts/line-chart"

const fetcher = (url, body) => fetch(url, body).then((r) => r.json())

export default function SimulationPage() {
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
  const [params, setParams] = useState({ rpm: 315, load_tph: 55, moisture_pct: 3, horizon: 60 })
  const { data, mutate, isLoading } = useSWR(
    hasPermission("simulation.run") ? ["/api/simulate/run", params] : null,
    ([url, p]) => fetcher(url, { method: "POST", body: JSON.stringify(p) }),
  )

  return (
    <main className="p-4 space-y-4">
      <div className="rounded-lg border border-border bg-[var(--panel)] p-4">
        <div className="text-sm text-muted-foreground mb-2">Simulation Controls</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Slider
            label="RPM"
            value={params.rpm}
            min={200}
            max={400}
            onChange={(v) => setParams((s) => ({ ...s, rpm: v }))}
          />
          <Slider
            label="Load (t/h)"
            value={params.load_tph}
            min={20}
            max={120}
            onChange={(v) => setParams((s) => ({ ...s, load_tph: v }))}
          />
          <Slider
            label="Moisture (%)"
            value={params.moisture_pct}
            min={0}
            max={10}
            onChange={(v) => setParams((s) => ({ ...s, moisture_pct: v }))}
          />
          <Slider
            label="Horizon (s)"
            value={params.horizon}
            min={15}
            max={240}
            onChange={(v) => setParams((s) => ({ ...s, horizon: v }))}
          />
        </div>
        <div className="mt-4">
          <button
            onClick={() => mutate()}
            className="px-3 py-2 rounded-md bg-[var(--brand)] text-[var(--on-brand)] hover:opacity-90 cursor-pointer"
          >
            Run Simulation
          </button>
        </div>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Running simulation...</div>}

      {data && (
        <div className="grid grid-cols-1 gap-4">
          <div>
            <h3 className="mb-2 text-sm text-muted-foreground">Power (kW) — simulated</h3>
            <LineChart data={data.timeseries?.map((d) => ({ t: d.t, value: d.power_kw })) ?? []} />
          </div>
          <div className="rounded-lg border border-border bg-[var(--panel)] p-4 text-sm">
            <div>KPI Summary</div>
            <ul className="mt-2 list-disc pl-4 text-muted-foreground">
              <li>
                Average kWh/ton: <span className="text-foreground">{data.kpi?.kwh_per_ton?.toFixed?.(2)}</span>
              </li>
              <li>
                Avg Power (kW): <span className="text-foreground">{data.kpi?.avg_power_kw?.toFixed?.(1)}</span>
              </li>
              <li>
                Throughput (t/h): <span className="text-foreground">{data.kpi?.load_tph?.toFixed?.(1)}</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </main>
  )
}

function Slider({ label, value, min, max, onChange }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1">
        {label}: <span className="text-foreground">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer"
      />
    </div>
  )
}
