export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const machineId = searchParams.get("machine_id") || "plant_aggregate"

  const stream = new ReadableStream({
    start(controller) {
      let t = 0
      const base = {
        load_tph: machineId === "plant_aggregate" ? 220 : 55,
        rpm: machineId === "plant_aggregate" ? 0 : 315,
        vibration: 4.8,
        temperature_c: 78,
        ore_grade: 0.52,
        moisture_pct: 3.1,
      }

      function send() {
        t += 1
        const noise = (n) => (Math.sin(t / 7) + Math.cos(t / 5)) * n
        const load = base.load_tph + noise(3)
        const power = machineId === "plant_aggregate" ? 480 + noise(15) : 120 + 0.8 * (load - 55) + noise(4)
        const rpm = base.rpm ? base.rpm + Math.round(noise(2)) : 0
        const payload = {
          timestamp: new Date().toISOString(),
          plant_id: "nmdc_demo_01",
          machine_id: machineId,
          metric: {
            power_kw: Number(power.toFixed(2)),
            load_tph: Number(load.toFixed(2)),
            rpm,
            vibration: Number((base.vibration + Math.abs(noise(0.2))).toFixed(2)),
            temperature_c: Number((base.temperature_c + Math.abs(noise(0.4))).toFixed(1)),
            ore_grade: base.ore_grade,
            moisture_pct: base.moisture_pct,
          },
        }
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(payload)}\n\n`))
      }

      const interval = setInterval(send, 1000)
      send()

      const close = () => clearInterval(interval)
      // not all runtimes support cancel signal; safe-guard
      try {
        req.signal?.addEventListener?.("abort", close)
      } catch {}
    },
    cancel() {},
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
