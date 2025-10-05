import { renewableForecast } from "../data/dummy.js"

export default function Scheduling() {
  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="text-sm font-semibold">Renewable Availability (Next 24h)</div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {renewableForecast.map((r, i) => {
            const total = r.solarMW + r.windMW
            const pct = Math.min(100, Math.round((total / 40) * 100)) // assume 40 MW max showcase
            return (
              <div key={i} className="card p-3">
                <div className="text-xs text-gray-500">{r.hour}</div>
                <div className="mt-2 h-2 w-full rounded bg-[rgb(var(--muted))]">
                  <div className="h-2 rounded bg-[rgb(var(--brand-600))]" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  Solar {r.solarMW.toFixed(1)} MW • Wind {r.windMW.toFixed(1)} MW
                </div>
                <div className="mt-1 text-xs">
                  Recommended mode:{" "}
                  <span className="font-medium">
                    {pct > 60 ? "High-throughput" : pct > 30 ? "Balanced" : "Energy-saving"}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
