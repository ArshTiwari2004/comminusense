"use client"

import { useEffect, useRef, useState } from "react"

export function useTelemetryStream({ machineId }) {
  const [latest, setLatest] = useState(null)
  const [history, setHistory] = useState([])
  const esRef = useRef(null)

  useEffect(() => {
    const url = `/api/telemetry/stream${machineId ? `?machine_id=${encodeURIComponent(machineId)}` : ""}`
    const es = new EventSource(url)
    esRef.current = es
    es.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data)
        setLatest(msg)
        setHistory((prev) => {
          const next = [...prev, { t: new Date(msg.timestamp).toLocaleTimeString(), value: msg.metric.power_kw }]
          return next.slice(-120)
        })
      } catch {}
    }
    es.onerror = () => {
      es.close()
      esRef.current = null
    }
    return () => {
      if (esRef.current) esRef.current.close()
    }
  }, [machineId])

  return { latest, history }
}
