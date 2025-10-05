"use client"

import { useParams } from "next/navigation"
import Sidebar from "@/components/layout/sidebar"
import Topbar from "@/components/layout/topbar"
import { RequireAuth } from "@/hooks/use-auth"
import LineChart from "@/components/charts/line-chart"
import { useTelemetryStream } from "@/hooks/use-telemetry"
import useSWR from "swr"

const fetcher = (url, body) => fetch(url, body).then((r) => r.json())

export default function MachineDetail() {
  const { id } = useParams()
  return (
    <RequireAuth>
      <div className="min-h-dvh bg-background text-foreground flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <Content id={id} />
        </div>
      </div>
    </RequireAuth>
  )
}

function Content({ id }) {
  const { latest, history } = useTelemetryStream({ machineId: id })
  const { data: rec } = useSWR(latest ? ["/api/models/energy/predict", latest] : null, ([url, payload]) =>
    fetcher(url, { method: "POST", body: JSON.stringify(payload) }),
  )

  return (
    <main className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Machine: {id}</h2>
        <div className="text-sm text-muted-foreground">
          Timestamp: {latest ? new Date(latest.timestamp).toLocaleTimeString() : "--"}
        </div>
      </div>

      {rec && (
        <div className="rounded-lg border border-border bg-[var(--panel)] p-4">
          <div className="text-sm text-muted-foreground mb-2">AI Recommendation</div>
          <div className="text-sm">
            Predicted kWh/ton: <span className="font-semibold">{rec.predicted_kwh_per_ton?.toFixed?.(2)}</span>
          </div>
          <ul className="mt-2 text-sm list-disc pl-4">
            {rec.recommendations?.map((r, i) => (
              <li key={i}>
                {r.param}: {r.from} → <span className="font-semibold">{r.to}</span> (Δ {r.expected_delta_kwh_per_ton}{" "}
                kWh/ton)
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <div>
          <h3 className="mb-2 text-sm text-muted-foreground">Power (kW)</h3>
          <LineChart data={history} xKey="t" yKey="value" />
        </div>
      </div>
    </main>
  )
}
