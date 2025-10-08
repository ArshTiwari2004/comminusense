"use client";
import Sidebar from "@/components/layout/sidebar"
import Topbar from "@/components/layout/topbar"
import { RequireAuth } from "@/hooks/use-auth"
import { useState } from "react";

// SVG Icons for different alert levels for a richer UI
const Icons = {
  normal: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  alert: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export default function MaintenanceAlert() {
  const [form, setForm] = useState({
    vibration: "0.02",
    temperature_c: "78.5",
    rpm: "315",
    power_kw: "1250.5",
    age_hours: "1245",
    historical_failures: "2",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [overlay, setOverlay] = useState(null); // State to control the overlay { color, level }

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

      // --- UI ENHANCEMENT LOGIC ---
      // Determine overlay color based on the alert level
      const alertLevel = data.alert_level.toLowerCase();
      let overlayData = null;
      if (alertLevel.includes("normal")) {
        overlayData = { color: "green", level: data.alert_level };
      } else if (alertLevel.includes("warning")) {
        overlayData = { color: "orange", level: data.alert_level };
      } else if (alertLevel.includes("critical")) {
        overlayData = { color: "red", level: data.alert_level };
      }
      
      // Show overlay for 1 second
      if (overlayData) {
        setOverlay(overlayData);
        setTimeout(() => {
          setOverlay(null);
        }, 1000);
      }
      
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Map overlay states to Tailwind CSS classes for easy management
  const overlayStyles = {
    green: "bg-green-500/80",
    orange: "bg-orange-400/80",
    red: "bg-red-600/80",
  };

  return (
    <>
      {/* --- UI ENHANCEMENT: Full Screen Overlay --- */}
      {overlay && (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center text-white transition-opacity duration-300 ${overlayStyles[overlay.color]}`}>
          {overlay.color === 'green' && Icons.normal}
          {overlay.color === 'orange' && Icons.warning}
          {overlay.color === 'red' && Icons.alert}
          <h2 className="mt-4 text-5xl font-bold uppercase tracking-wider">
            {overlay.level}
          </h2>
        </div>
      )}

      <div className="max-w-3xl mx-auto p-6 md:p-8 bg-slate-50 rounded-lg shadow-md mt-10">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-3">
          Predictive Maintenance Alert
        </h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.keys(form).map((key) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                {key.replace(/_/g, " ")}
              </label>
              <input
                type="number"
                step="any"
                name={key}
                value={form[key]}
                onChange={handleChange}
                className="w-full border-gray-300 px-3 py-2 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 transition"
                required
              />
            </div>
          ))}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-emerald-700 text-white px-6 py-3 rounded-md hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 font-semibold transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:scale-100"
              disabled={loading}
            >
              {loading ? "Analyzing Data..." : "Predict Maintenance Status"}
            </button>
          </div>
        </form>

        {error && <p className="mt-6 text-center font-semibold text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}

        {result && (
          <div className="mt-8 p-6 border-l-4 rounded-r-lg shadow-sm" style={{ borderColor: result.status_color }}>
            <h2 className="text-2xl font-bold mb-3 text-gray-800">Prediction Result</h2>
            <div className="space-y-3">
              <p className="text-lg">
                <strong>Alert Level:</strong>{" "}
                <span className="font-bold px-3 py-1 rounded-full text-white" style={{ backgroundColor: result.status_color }}>
                  {result.alert_level}
                </span>
              </p>
              <p className="text-lg">
                <strong>Risk Score:</strong>
                <span className="font-semibold text-gray-700"> {result.maintenance_risk_score}</span>
              </p>
              <p className="text-lg">
                <strong>Primary Action:</strong>
                <span className="font-semibold text-gray-700"> {result.primary_action}</span>
              </p>

              <div className="pt-3">
                <h3 className="text-xl font-semibold text-gray-800">Recommendations:</h3>
                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx}>
                      <strong className="capitalize text-gray-700">{rec.param.replace(/_/g, " ")}:</strong> {rec.value} → <span className="font-medium text-emerald-700">{rec.suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}