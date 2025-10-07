export async function POST(req) {
  const { rpm = 315, load_tph = 55, moisture_pct = 3, horizon = 60 } = await req.json().catch(() => ({}))
  const N = Math.max(10, Math.min(600, Number(horizon)))
  const timeseries = []
  let sumPower = 0
  for (let i = 0; i < N; i++) {
    const noise = (n) => (Math.sin(i / 6) + Math.cos(i / 5)) * n
    const adjLoad = load_tph - moisture_pct * 0.8 + noise(1.2)
    const power = 60 + 0.6 * adjLoad + 0.08 * (rpm - 250) + noise(2.5)
    sumPower += power
    timeseries.push({ t: `${i}s`, power_kw: Number(power.toFixed(2)) })
  }
  const avgPower = sumPower / N
  const kwhPerTon = avgPower / Math.max(1, load_tph)
  return Response.json({
    timeseries,
    kpi: { kwh_per_ton: kwhPerTon, avg_power_kw: avgPower, load_tph },
  })
}
