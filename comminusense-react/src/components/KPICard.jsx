export default function KPICard({ label, value, unit, delta, tone = "neutral" }) {
  const color = tone === "good" ? "text-green-600" : tone === "bad" ? "text-red-600" : "text-gray-500"
  return (
    <div className="kpi">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-2xl font-bold">{value}</div>
        {unit && <div className="text-sm text-gray-500">{unit}</div>}
      </div>
      {delta !== undefined && <div className={`mt-2 text-xs ${color}`}>{delta > 0 ? `+${delta}` : delta}%</div>}
    </div>
  )
}
