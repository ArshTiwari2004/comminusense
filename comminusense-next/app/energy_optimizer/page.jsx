"use client";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { useState } from "react";

// Helper component for stat cards
const StatCard = ({ title, value, highlight = false }) => (
  <div className="bg-white p-4 rounded-md border border-gray-300 text-center">
    <h3 className="text-sm text-gray-600 font-medium">{title}</h3>
    <p
      className={`text-3xl font-bold ${
        highlight ? "text-emerald-500" : "text-gray-800"
      }`}
    >
      {value}
    </p>
  </div>
);

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
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        setError(
          "Could not connect to the prediction service. Please check your connection."
        );
      } else {
        setError(
          err.message || "Failed to get prediction. Please try again later."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white text-black">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">
              Energy Optimization Predictor
            </h1>

            {/* Main Content Card */}
            <div className="bg-white p-6 lg:p-8 rounded-md border border-gray-300 space-y-8">
              {/* Form Section */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold border-b pb-2 mb-4">
                    Machine Parameters
                  </h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    {Object.keys(form).map((field) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                          {field.replaceAll("_", " ")}
                        </label>
                        <input
                          type="number"
                          step="any"
                          required
                          name={field}
                          value={form[field]}
                          onChange={handleChange}
                          className="w-full px-3 py-2 rounded-md border border-gray-400 focus:ring-1 focus:ring-black focus:border-black outline-none transition"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 rounded-md transition-all duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                  {loading ? "Predicting..." : "Predict Energy Usage"}
                </button>
              </form>

              {/* Error Message */}
              {error && (
                <div className="text-center font-medium text-red-700 p-4 bg-gray-100 border border-gray-300 rounded-md">
                  {error}
                </div>
              )}

              {/* Results Section */}
              {result && (
                <div className="space-y-8 border-t pt-8">
                  <h2 className="text-2xl font-bold text-center">
                    Prediction Results
                  </h2>

                  {/* Summary */}
                  <div className="grid sm:grid-cols-2 gap-6">
                    <StatCard
                      title="Current kWh/ton"
                      value={result.current_kwh_per_ton}
                      highlight
                    />
                    <StatCard
                      title="Predicted kWh/ton"
                      value={result.predicted_kwh_per_ton}
                      highlight
                    />
                  </div>

                  {/* Recommendations */}
                  {result.recommendations?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold mb-3">
                        Optimization Recommendations
                      </h3>
                      <div className="border border-gray-300 rounded-md">
                        {result.recommendations.map((r, i) => (
                          <div
                            key={i}
                            className="p-4 flex justify-between items-center border-b border-gray-300 last:border-b-0"
                          >
                            <span className="font-medium capitalize">
                              {r.param.replaceAll("_", " ")}: {r.from} →{" "}
                              <span className="font-bold text-emerald-500">{r.to}</span>
                            </span>
                            <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                              Δ {r.expected_delta_kwh_per_ton} kWh/ton
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Explainability */}
                  {result.explainability?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold mb-3">
                        Feature Importance
                      </h3>
                      <div className="overflow-x-auto border border-gray-300 rounded-md">
                        <table className="min-w-full text-sm">
                          <thead className="bg-gray-100 text-gray-700">
                            <tr>
                              <th className="p-3 text-left font-semibold">
                                Feature
                              </th>
                              <th className="p-3 text-left font-semibold">
                                Value
                              </th>
                              <th className="p-3 text-left font-semibold">
                                Impact
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white">
                            {result.explainability.map((f, i) => (
                              <tr key={i} className="border-t border-gray-300">
                                <td className="p-3 capitalize font-medium">
                                  {f.feature.replaceAll("_", " ")}
                                </td>
                                <td className="p-3 text-gray-700">{f.value}</td>
                                <td className="p-3 font-semibold text-black">
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
          </div>
        </main>
      </div>
    </div>
  );
}