"use client";

import { useState } from "react";

export default function MaintenanceAlert() {
  const [form, setForm] = useState({
    vibration: "",
    temperature_c: "",
    rpm: "",
    power_kw: "",
    age_hours: "",
    historical_failures: "",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("https://comminusense.onrender.com/maintenance/alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vibration: parseFloat(form.vibration),
          temperature_c: parseFloat(form.temperature_c),
          rpm: parseFloat(form.rpm),
          power_kw: parseFloat(form.power_kw),
          age_hours: parseFloat(form.age_hours),
          historical_failures: parseInt(form.historical_failures),
        }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-lg mt-10">
      <h1 className="text-2xl font-bold mb-4">Maintenance Alert</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {Object.keys(form).map((key) => (
          <div key={key}>
            <label className="block font-semibold mb-1 capitalize">{key.replace("_", " ")}</label>
            <input
              type="number"
              step="any"
              name={key}
              value={form[key]}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
        ))}
        <button
          type="submit"
          className="bg-emerald-800 text-white px-6 py-2 rounded hover:bg-emerald-700"
          disabled={loading}
        >
          {loading ? "Predicting..." : "Predict Maintenance Alert"}
        </button>
      </form>

      {error && <p className="mt-4 text-red-600">{error}</p>}

      {result && (
        <div className="mt-6 p-4 border rounded">
          <h2 className="text-xl font-bold mb-2">Alert Result</h2>
          <p>
            <strong>Alert Level:</strong>{" "}
            <span style={{ color: result.status_color }}>{result.alert_level}</span>
          </p>
          <p>
            <strong>Risk Score:</strong> {result.maintenance_risk_score}
          </p>
          <p>
            <strong>Primary Action:</strong> {result.primary_action}
          </p>

          <h3 className="mt-4 font-semibold">Recommendations:</h3>
          <ul className="list-disc list-inside">
            {result.recommendations.map((rec, idx) => (
              <li key={idx}>
                <strong>{rec.param}:</strong> {rec.value} → {rec.suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
