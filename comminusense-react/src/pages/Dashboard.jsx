import useSWR from "swr"
import KPICard from "../components/KPICard.jsx"
import LineTrend from "../components/charts/LineTrend.jsx"
import { kpis } from "../data/dummy.js"
import { useTelemetry } from "../hooks/useTelemetry.jsx"

const fetcher = (key) => {
  if (key === "kpis") return Promise.resolve(kpis)
  return Promise.resolve(null)
}

export default function Dashboard() {
  const { data: kpi } = useSWR("kpis", fetcher, { refreshInterval: 10000 })
  const telem = useTelemetry()

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Energy Intensity"
          value={kpi?.energyIntensity.value}
          unit={kpi?.energyIntensity.unit}
          delta={kpi?.energyIntensity.delta}
          tone="good"
        />
        <KPICard
          label="Throughput"
          value={kpi?.throughput.value}
          unit={kpi?.throughput.unit}
          delta={kpi?.throughput.delta}
        />
        <KPICard
          label="Utilization"
          value={kpi?.utilization.value}
          unit={kpi?.utilization.unit}
          delta={kpi?.utilization.delta}
        />
        <KPICard
          label="CO₂ Intensity"
          value={kpi?.co2Intensity.value}
          unit={kpi?.co2Intensity.unit}
          delta={kpi?.co2Intensity.delta}
          tone="good"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LineTrend data={telem} lines={[{ dataKey: "kwh_t", color: "rgb(2,132,199)" }]} />
        <LineTrend data={telem} lines={[{ dataKey: "tph", color: "rgb(20,184,166)" }]} />
      </div>
    </div>
  )
}
