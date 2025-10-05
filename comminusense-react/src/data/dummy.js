export const kpis = {
  energyIntensity: { value: 18.7, unit: "kWh/t", delta: -3.2 },
  throughput: { value: 1240, unit: "tph", delta: 2.1 },
  utilization: { value: 92.4, unit: "%", delta: 0.6 },
  co2Intensity: { value: 0.42, unit: "tCO2/MWh", delta: -1.1 },
}

export const maintenanceTickets = [
  {
    id: "MT-1021",
    asset: "Ball Mill #2 Bearing",
    severity: "High",
    etaDays: 7,
    status: "Open",
    recommendation: "Inspect lubrication and replace bearing if wear > 0.5mm.",
  },
  {
    id: "MT-1022",
    asset: "Crusher Gap Actuator",
    severity: "Medium",
    etaDays: 21,
    status: "Open",
    recommendation: "Schedule calibration during next planned stop.",
  },
  {
    id: "MT-1023",
    asset: "Gearbox #1",
    severity: "Low",
    etaDays: 45,
    status: "Planned",
    recommendation: "Monitor vibration; replace seal next maintenance window.",
  },
]

export const renewableForecast = Array.from({ length: 24 }, (_, h) => ({
  hour: `${h}:00`,
  solarMW: Math.max(0, -Math.pow(h - 12, 2) + 144) * 0.1, // bell curve
  windMW: 12 + 6 * Math.sin((h / 24) * Math.PI * 2),
}))

export const users = [
  { id: "u1", email: "operator@example.com", role: "operator" },
  { id: "u2", email: "eng@example.com", role: "engineer" },
  { id: "u3", email: "manager@example.com", role: "manager" },
  { id: "u4", email: "admin@example.com", role: "admin" },
]
