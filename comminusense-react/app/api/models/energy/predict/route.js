export async function POST(req) {
  const body = await req.json().catch(() => ({}))
  const m = body?.metric || {}
  const load = Number(m.load_tph || 55)
  const power = Number(m.power_kw || 120)
  const rpm = Number(m.rpm || 315)

  const kwhPerTon = load > 0 ? power / load : 0
  const targetRpm = rpm > 300 ? Math.max(260, rpm - 15) : rpm + 5
  const expectedDelta = targetRpm < rpm ? -0.6 : 0.2

  return Response.json({
    predicted_kwh_per_ton: kwhPerTon * (1 + (expectedDelta < 0 ? -0.03 : 0.02)),
    current_kwh_per_ton: kwhPerTon,
    recommendations: [{ param: "rpm", from: rpm, to: targetRpm, expected_delta_kwh_per_ton: expectedDelta.toFixed(2) }],
    explainability: { shap: [{ feature: "load_tph", value: load, impact: 0.35 }] },
  })
}
