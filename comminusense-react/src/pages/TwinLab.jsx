"use client"

import { useMemo, useState } from "react"
import KPICard from "../components/KPICard.jsx"

export default function TwinLab() {
  const [inputs, setInputs] = useState({
    oreHardness: 0.5, // 0..1
    feedSize: 25, // mm
    millRPM: 78,
    crusherGap: 12,
  })

  const outputs = useMemo(() => {
    // toy model: higher hardness ↑ kWh/t, lower throughput; smaller gap ↑ kWh/t, ↑ throughput slightly; RPM moderate optimum
    const baseKWhT = 17 + inputs.oreHardness * 6 + Math.max(0, (12 - inputs.crusherGap) * 0.2)
    const rpmPenalty = Math.abs(inputs.millRPM - 78) * 0.05
    const kwh_t = Number((baseKWhT + rpmPenalty).toFixed(2))

    const baseTPH =
      1200 -
      inputs.oreHardness * 250 +
      Math.max(0, (25 - inputs.feedSize) * 4) +
      Math.max(0, (12 - inputs.crusherGap) * 6)
    const tph = Math.max(800, Math.round(baseTPH))

    return { kwh_t, tph }
  }, [inputs])

  function slider(name, min, max, step = 1, unit = "") {
    return (
      <div>
        <div className="label">{name}</div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={inputs[name]}
          onChange={(e) => setInputs((s) => ({ ...s, [name]: Number(e.target.value) }))}
          className="w-full cursor-pointer"
        />
        <div className="text-sm text-gray-500 mt-1">
          {inputs[name]} {unit}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-4 space-y-4">
          <div className="text-sm font-semibold">Inputs</div>
          {slider("oreHardness", 0, 1, 0.01)}
          {slider("feedSize", 10, 40, 1, "mm")}
          {slider("millRPM", 60, 95, 1, "rpm")}
          {slider("crusherGap", 8, 20, 1, "mm")}
        </div>
        <div className="card p-4 space-y-4">
          <div className="text-sm font-semibold">Outputs</div>
          <div className="grid grid-cols-2 gap-4">
            <KPICard label="Energy Intensity" value={outputs.kwh_t} unit="kWh/t" />
            <KPICard label="Throughput" value={outputs.tph} unit="tph" />
          </div>
          <div className="text-xs text-gray-500">
            Use Twin Lab to trial setpoints safely before applying in Operations.
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm font-semibold">Recommendation</div>
          <p className="text-sm text-gray-600 mt-2">
            Target mill RPM near 78 for optimal energy use. Avoid crusher gaps below 10 mm unless throughput targets
            require it.
          </p>
          <button className="btn btn-primary mt-4">Export Scenario</button>
        </div>
      </div>
    </div>
  )
}
