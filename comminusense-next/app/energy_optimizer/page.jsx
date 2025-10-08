"use client";
import { useState } from "react";

export default function EnergyOptimizer() {
  const [form, setForm] = useState({
    power_kw: "",
    load_tph: "",
    rpm: "",
    vibration: "",
    temperature_c: "",
    ore_grade: "",
    moisture_pct: "",
    mill_fill_pct: "",
    media_size_mm: "",
    last_15m_power_avg: "",
    last_15m_load_avg: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("https://comminusense.onrender.com/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          Object.fromEntries(
            Object.entries(form).map(([k, v]) => [k, parseFloat(v)])
          )
        ),
      });

      if (!res.ok) throw new Error("Failed to fetch results");

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold text-emerald-800 mb-6">
        ⚡ Energy Optimization Predictor
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-4 bg-white shadow-lg p-6 rounded-2xl max-w-3xl"
      >
        {Object.keys(form).map((key) => (
          <div key={key} className="flex flex-col">
            <label className="font-medium text-emerald-700 capitalize">
              {key.replace(/_/g, " ")}
            </label>
            <input
              type="number"
              step="any"
              name={key}
              value={form[key]}
              onChange={handleChange}
              required
              className="border border-emerald-300 rounded-md p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={loading}
          className="col-span-2 mt-4 bg-emerald-700 text-white py-2 rounded-md hover:bg-emerald-800 transition"
        >
          {loading ? "Predicting..." : "Predict Energy Usage"}
        </button>
      </form>

      {error && (
        <p className="text-red-600 mt-4 bg-red-100 p-2 rounded">{error}</p>
      )}

      {result && (
        <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg w-full max-w-2xl">
          <h2 className="text-xl font-semibold text-emerald-800 mb-3">
            Results
          </h2>
          <p>
            <b>Current kWh/ton:</b> {result.current_kwh_per_ton}
          </p>
          <p>
            <b>Predicted kWh/ton:</b> {result.predicted_kwh_per_ton}
          </p>

          <h3 className="text-lg mt-4 font-medium text-emerald-700">
            Recommendations:
          </h3>
          <ul className="list-disc pl-6">
            {result.recommendations.map((rec, i) => (
              <li key={i}>
                Change <b>{rec.param}</b> from <b>{rec.from}</b> to{" "}
                <b>{rec.to}</b> (Δ {rec.expected_delta_kwh_per_ton} kWh/ton)
              </li>
            ))}
          </ul>

          <h3 className="text-lg mt-4 font-medium text-emerald-700">
            Explainability:
          </h3>
          <ul className="list-disc pl-6">
            {result.explainability.map((exp, i) => (
              <li key={i}>
                {exp.feature}: value {exp.value}, impact {exp.impact}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
