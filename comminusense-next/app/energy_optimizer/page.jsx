"use client";
import React, { useState } from "react";

// Assuming this component is named EnergyOptimizer and is the default export
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

  // result can hold null, a successful data object, or an error object.
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // State to hold fetch or server errors

  const handleChange = (e) => {
    // Basic number parsing for inputs
    let value = e.target.value;
    if (e.target.type === "number") {
        value = parseFloat(value);
    }
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null); // Clear previous errors

    try {
      const res = await fetch("https://comminusense.onrender.com/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // NOTE: The backend /predict only expects 5 specific fields (temperature_c, humidity_percent, etc.).
        // We are sending the whole form here, which is fine as FastAPI ignores extra fields, 
        // but if the backend code changes, this might cause issues.
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        // Handle HTTP errors (4xx, 5xx)
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(`API Error ${res.status}: ${errorData.detail || errorData.message}`);
      }

      const data = await res.json();
      setResult(data);
      
    } catch (err) {
      console.error("Fetch failed:", err);
      setError(err.message || "An unknown error occurred during prediction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-emerald-800">
        ⚙️ Energy Optimization Predictor
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-white p-6 rounded-xl shadow-lg">
        {Object.keys(form).map((key) => (
          <div key={key} className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 capitalize">
                {key.replace(/_/g, ' ')}
            </label>
            <input
              type="number"
              step="any"
              name={key}
              value={form[key]}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-150"
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={loading}
          className="col-span-1 md:col-span-2 lg:col-span-3 bg-emerald-700 text-white p-3 rounded-lg hover:bg-emerald-800 transition duration-150 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Predicting..." : "Run Prediction"}
        </button>
      </form>

      {/* Display General Error Message */}
      {error && (
        <div className="mt-6 p-4 bg-red-100 text-red-700 border border-red-400 rounded-lg shadow-md">
          <p className="font-semibold">Prediction Failed:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Display Results or Loading Spinner */}
      {result && (
        <div className="mt-6 bg-white p-6 rounded-xl shadow-lg border-t-4 border-emerald-500">
          <h2 className="text-2xl font-bold text-emerald-700 mb-4">Results Summary</h2>
          
          {/* Displaying simple predicted values */}
          {(result.predicted_efficiency || result.optimized_output) && (
             <div className="grid grid-cols-2 gap-4 border-b pb-4 mb-4">
                <p><b>Predicted Efficiency:</b> <span className="text-emerald-600 font-bold">{result.predicted_efficiency?.toFixed(4) || 'N/A'}</span></p>
                <p><b>Optimized Output:</b> <span className="text-emerald-600 font-bold">{result.optimized_output?.toFixed(4) || 'N/A'}</span></p>
            </div>
          )}

          {/* Conditional Rendering for Recommendations */}
          {result.recommendations?.length > 0 && ( // Check if array exists and has elements
            <>
              <h3 className="mt-4 font-semibold text-gray-800">Recommendations:</h3>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="text-sm text-gray-600">
                    {r.param}: {r.from} → {r.to} (Δ {r.expected_delta_kwh_per_ton})
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Conditional Rendering for Explainability */}
          {result.explainability?.length > 0 && ( // Check if array exists and has elements
            <>
              <h3 className="mt-4 font-semibold text-gray-800">Explainability:</h3>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                {result.explainability.map((e, i) => (
                  <li key={i} className="text-sm text-gray-600">
                    {e.feature}: impact {e.impact}
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Fallback for the simple prediction object */}
          {!result.recommendations && !result.explainability && (
              <p className="text-gray-500 italic mt-4">Note: The backend returned a simple prediction. Full analysis data (recommendations/explainability) is currently unavailable.</p>
          )}

        </div>
      )}
    </div>
  );
}
