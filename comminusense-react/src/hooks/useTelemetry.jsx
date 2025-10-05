"use client"

import { useEffect, useRef, useState } from "react"

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

export function useTelemetry() {
  const [data, setData] = useState([])
  const tRef = useRef(0)
  const ref = useRef({ kwh_t: 18.5, tph: 1200, load: 78, temp: 68 })

  useEffect(() => {
    const id = setInterval(() => {
      tRef.current += 1
      // random walk
      ref.current.kwh_t = clamp(ref.current.kwh_t + (Math.random() - 0.5) * 0.3, 15, 22)
      ref.current.tph = clamp(ref.current.tph + (Math.random() - 0.5) * 12, 1000, 1400)
      ref.current.load = clamp(ref.current.load + (Math.random() - 0.5) * 2, 60, 95)
      ref.current.temp = clamp(ref.current.temp + (Math.random() - 0.5) * 0.8, 60, 80)

      setData((prev) => {
        const next = prev.concat({
          t: tRef.current,
          kwh_t: Number(ref.current.kwh_t.toFixed(2)),
          tph: Math.round(ref.current.tph),
          load: Number(ref.current.load.toFixed(1)),
          temp: Number(ref.current.temp.toFixed(1)),
        })
        // cap length
        return next.length > 120 ? next.slice(next.length - 120) : next
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return data
}
