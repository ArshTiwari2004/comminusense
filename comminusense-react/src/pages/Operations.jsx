"use client"

import { useMemo, useState } from "react"
import LineTrend from "../components/charts/LineTrend.jsx"
import { useTelemetry } from "../hooks/useTelemetry.jsx"

export default function Operations() {
  const telem = useTelemetry()
  const [setpoints, setSetpoints] = useState({ gap_mm: 12, mill_rpm: 78, feed_tph: 1200 })

  const latest = telem[telem.length - 1]
  const suggestion = useMemo(() => {
    if (!latest) return setpoints
    // simple heuristic: if kWh/t > 19, reduce mill rpm slightly; if tph < 1150, increase feed
    let { gap_mm, mill_rpm, feed_tph } = setpoints
    if (latest.kwh_t > 19) mill_rpm = Math.max(70, mill_rpm - 1)
    if (latest.tph < 1150) feed_tph = Math.min(1400, feed_tph + 10)
    return { gap_mm, mill_rpm, feed_tph }
  }, [latest, setpoints])

  function applySuggestion() {
    setSetpoints(suggestion)
  }

  return (
    <div className="space-y-6">
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Current Setpoints</div>
            <div className="mt-2 flex gap-4">
              <div className="badge">
                Crusher Gap: <span className="ml-1 font-semibold">{setpoints.gap_mm} mm</span>
              </div>
              <div className="badge">
                Mill Speed: <span className="ml-1 font-semibold">{setpoints.mill_rpm} rpm</span>
              </div>
              <div className="badge">
                Feed Rate: <span className="ml-1 font-semibold">{setpoints.feed_tph} tph</span>
              </div>
            </div>
          </div>
          <button className="btn btn-primary" onClick={applySuggestion}>
            Apply Suggested
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LineTrend data={telem} lines={[{ dataKey: "kwh_t", color: "rgb(2,132,199)" }]} />
        <LineTrend data={telem} lines={[{ dataKey: "load", color: "rgb(20,184,166)" }]} />
      </div>
    </div>
  )
}
