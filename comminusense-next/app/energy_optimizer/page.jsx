"use client";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { useState } from "react";

export default function PredictPage() {
  const [form, setForm] = useState({
    power_kw: "1250.5",
    load_tph: "55.2",
    rpm: "315",
    vibration: "0.02",
    temperature_c: "78.5",
    ore_grade: "0.48",
    moisture_pct: "3.2",
    mill_fill_pct: "85.0",
    media_size_mm: "8",
    last_15m_power_avg: "1230.0",
    last_15m_load_avg: "54.5",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    // Client-side validation to ensure all fields are filled and are numeric
    const formValues = Object.values(form);
    if (formValues.some((val) => val === "" || isNaN(parseFloat(val)))) {
      setError("All fields are required and must be valid numbers.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("https://comminusense.onrender.com/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          Object.fromEntries(
            Object.entries(form).map(([key, val]) => [key, parseFloat(val)])
          )
        ),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({
          detail: `API request failed with status: ${res.status}`,
        }));
        throw new Error(errorData.detail || "An unknown error occurred.");
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      // Provide a more helpful error message for fetch failures
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        setError(
          "Could not connect to the prediction service. The server may be down or there could be a network (CORS) issue. Please check the server status."
        );
      } else {
        setError(err.message || "Failed to get prediction. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 bg-emerald-900 text-white p-6">
          <div className="max-w-5xl mx-auto space-y-10">
            <h1 className="text-4xl font-bold text-center text-emerald-300 drop-shadow-lg">
              ⚡ Energy Optimization Predictor
            </h1>

            {/* Form Section */}
            <form
              onSubmit={handleSubmit}
              className="grid md:grid-cols-2 gap-6 bg-emerald-800/50 p-6 rounded-2xl shadow-lg"
            >
              {Object.keys(form).map((field) => (
                <div key={field}>
                  <label className="block text-sm mb-1 capitalize">
                    {field.replaceAll("_", " ")}
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    name={field}
                    value={form[field]}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg text-black focus:ring-2 focus:ring-emerald-400 outline-none"
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={loading}
                className="md:col-span-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg shadow-md transition-all duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                {loading ? "Predicting..." : "Predict Energy Usage"}
              </button>
            </form>

            {/* Error Message */}
            {error && (
              <div className="text-center text-red-400 font-semibold p-4 bg-red-900/50 rounded-lg">
                {error}
              </div>
            )}

            {/* Results Section */}
            {result && (
              <div className="space-y-8 bg-emerald-800/30 p-6 rounded-2xl shadow-xl animate-fadeIn">
                <h2 className="text-2xl font-semibold text-center text-emerald-300">
                  🔍 Prediction Results
                </h2>

                {/* Summary */}
                <div className="grid sm:grid-cols-2 gap-6 text-center">
                  <div className="bg-emerald-700/40 p-4 rounded-xl shadow-md">
                    <h3 className="text-sm text-gray-300">Current kWh/ton</h3>
                    <p className="text-3xl font-bold text-white">
                      {result.current_kwh_per_ton}
                    </p>
                  </div>
                  <div className="bg-emerald-700/40 p-4 rounded-xl shadow-md">
                    <h3 className="text-sm text-gray-300">Predicted kWh/ton</h3>
                    <p className="text-3xl font-bold text-emerald-300">
                      {result.predicted_kwh_per_ton}
                    </p>
                  </div>
                </div>

                {/* Recommendations */}
                {result.recommendations && result.recommendations.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-emerald-200">
                      ⚙️ Optimization Recommendations
                    </h3>
                    <div className="space-y-3">
                      {result.recommendations.map((r, i) => (
                        <div
                          key={i}
                          className="bg-emerald-700/40 p-4 rounded-xl flex justify-between items-center"
                        >
                          <span className="capitalize">
                            {r.param}: {r.from} → {r.to}
                          </span>
                          <span className="text-sm text-gray-300">
                            Δ {r.expected_delta_kwh_per_ton} kWh/ton
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Explainability */}
                {result.explainability && result.explainability.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-emerald-200">
                      🧠 Feature Importance
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-emerald-600 rounded-lg text-sm">
                        <thead className="bg-emerald-700 text-emerald-100">
                          <tr>
                            <th className="p-2 text-left">Feature</th>
                            <th className="p-2 text-left">Value</th>
                            <th className="p-2 text-left">Impact</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.explainability.map((f, i) => (
                            <tr
                              key={i}
                              className="border-t border-emerald-700 hover:bg-emerald-700/30 transition"
                            >
                              <td className="p-2 capitalize">
                                {f.feature.replaceAll("_", " ")}
                              </td>
                              <td className="p-2">{f.value}</td>
                              <td className="p-2 text-emerald-300">
                                {f.impact.toFixed(3)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

