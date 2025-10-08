"use client";
import React, { useState } from "react";

export default function EnergyOptimizer() {
  const [form, setForm] = useState({
    power_kw: 1250.5,
    load_tph: 55.2,
    rpm: 315,
    vibration: 0.02,
    temperature_c: 78.5,
    ore_grade: 0.48,
    moisture_pct: 3.2,
    mill_fill_pct: 85.0,
    media_size_mm: 8,
    last_15m_power_avg: 1230.0,
    last_15m_load_avg: 54.5,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: parseFloat(e.target.value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const res = await fetch("https://comminusense.onrender.com/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-emerald-800">
        ⚙️ Energy Optimization Predictor
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        {Object.keys(form).map((key) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700">{key}</label>
            <input
              type="number"
              step="any"
              name={key}
              value={form[key]}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-md p-2"
            />
          </div>
        ))}
        <button
          type="submit"
          className="col-span-2 bg-emerald-700 text-white p-2 rounded hover:bg-emerald-800"
        >
          {loading ? "Predicting..." : "Run Prediction"}
        </button>
      </form>

      {result && (
        <div className="mt-6 bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold text-emerald-700 mb-3">Results</h2>
          <p><b>Current kWh/ton:</b> {result.current_kwh_per_ton}</p>
          <p><b>Predicted kWh/ton:</b> {result.predicted_kwh_per_ton}</p>

          <h3 className="mt-4 font-semibold">Recommendations:</h3>
          <ul className="list-disc pl-5">
            {result.recommendations.map((r, i) => (
              <li key={i}>{r.param}: {r.from} → {r.to} (Δ {r.expected_delta_kwh_per_ton})</li>
            ))}
          </ul>

          <h3 className="mt-4 font-semibold">Explainability:</h3>
          <ul className="list-disc pl-5">
            {result.explainability.map((e, i) => (
              <li key={i}>{e.feature}: impact {e.impact}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
