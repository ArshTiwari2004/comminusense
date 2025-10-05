export async function POST(req) {
  const body = await req.json().catch(() => ({}))
  const vib = Number(body?.metric?.vibration || 5)
  const temp = Number(body?.metric?.temperature_c || 80)
  const risk = Math.min(1, Math.max(0, (vib - 4.5) * 0.15 + (temp - 75) * 0.01))
  return Response.json({
    failure_risk: Number(risk.toFixed(2)),
    recommendation: risk > 0.7 ? "Schedule inspection within 24 hours" : "Normal monitoring",
  })
}
