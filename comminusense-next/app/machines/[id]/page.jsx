"use client";

import { useParams } from "next/navigation";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { RequireAuth, useAuth } from "@/hooks/use-auth";
import LineChart from "@/components/charts/line-chart";
import { useTelemetryStream } from "@/hooks/use-telemetry";
import useSWR from "swr";
import { useState } from "react";

const fetcher = (url, body) => fetch(url, body).then((r) => r.json());

export default function MachineDetail() {
  const { id } = useParams();
  return (
    <RequireAuth>
      <div className="min-h-dvh bg-background text-foreground flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <Content id={id} />
        </div>
      </div>
    </RequireAuth>
  );
}

function Content({ id }) {
  const { hasPermission } = useAuth();
  const { latest, history } = useTelemetryStream({ machineId: id });
  const { data: rec } = useSWR(
    latest ? ["/api/models/energy/predict", latest] : null,
    ([url, payload]) =>
      fetcher(url, { method: "POST", body: JSON.stringify(payload) })
  );

  const [activeMetric, setActiveMetric] = useState("power");

  const exportCSV = () => {
    if (!history?.length) return;
    const headers = Object.keys(history[0]).join(",");
    const rows = history.map((d) => Object.values(d).join(",")).join("\n");
    const blob = new Blob([headers + "\n" + rows], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${id}_telemetry.csv`;
    link.click();
  };

  return (
    <main className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-semibold">Machine: {id}</h2>
          <div className="text-xs text-muted-foreground">
            Timestamp:{" "}
            {latest ? new Date(latest.timestamp).toLocaleTimeString() : "--"}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              latest ? "bg-green-500" : "bg-red-400"
            } animate-pulse`}
            title={latest ? "Live Telemetry Active" : "Disconnected"}
          />
          <button
            onClick={exportCSV}
            className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:opacity-90"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Machine Health Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <HealthCard
          label="Status"
          value={latest?.status || "Running"}
          color="green"
        />
        <HealthCard
          label="Efficiency (%)"
          value={latest?.efficiency?.toFixed(1) || "--"}
          color="blue"
        />
        <HealthCard
          label="Temperature (°C)"
          value={latest?.temperature_c?.toFixed(1) || "--"}
          color="orange"
        />
        <HealthCard
          label="Vibration (mm/s)"
          value={latest?.vibration?.toFixed(2) || "--"}
          color="purple"
        />
      </div>

      {/* AI Recommendation */}
      {rec && (
        <div className="rounded-lg border border-border bg-[var(--panel)] p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-muted-foreground">
              AI Recommendation
            </div>
            {hasPermission("recommendation.apply") && (
              <button className="px-3 py-1 text-xs bg-[var(--brand)] text-[var(--on-brand)] rounded-md hover:opacity-90">
                Apply Recommendation
              </button>
            )}
          </div>
          <div className="text-sm">
            Predicted kWh/ton:{" "}
            <span className="font-semibold">
              {rec.predicted_kwh_per_ton?.toFixed?.(2)}
            </span>
          </div>
          <ul className="mt-2 text-sm list-disc pl-4">
            {rec.recommendations?.map((r, i) => (
              <li key={i}>
                <strong>{r.param}</strong>: {r.from} →{" "}
                <span className="font-semibold text-[var(--brand)]">
                  {r.to}
                </span>{" "}
                (Δ {r.expected_delta_kwh_per_ton} kWh/ton)
              </li>
            ))}
          </ul>
          <div className="mt-2 text-xs text-muted-foreground italic">
            *Estimated improvement: {rec.expected_improvement_pct}% energy
            efficiency gain.
          </div>
        </div>
      )}

      {/* Trend Metrics */}
      <div className="rounded-lg border border-border bg-[var(--panel)] p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm text-muted-foreground">Performance Trends</h3>
          <div className="flex gap-2">
            {["power", "efficiency", "temperature", "vibration"].map(
              (metric) => (
                <button
                  key={metric}
                  onClick={() => setActiveMetric(metric)}
                  className={`px-3 py-1 text-xs rounded-md border ${
                    activeMetric === metric
                      ? "bg-[var(--brand)] text-[var(--on-brand)]"
                      : "bg-transparent hover:bg-muted"
                  }`}
                >
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </button>
              )
            )}
          </div>
        </div>
        <LineChart
          data={history}
          xKey="t"
          yKey={activeMetric === "power" ? "value" : activeMetric}
        />
      </div>

      {/* Maintenance Insights */}
      <div className="rounded-lg border border-border bg-[var(--panel)] p-4 text-sm">
        <div className="font-semibold mb-1">Maintenance Insights</div>
        <ul className="list-disc pl-4 text-muted-foreground space-y-1">
          <li>Last Maintenance: {latest?.last_maintenance || "12 Sep 2025"}</li>
          <li>Next Scheduled: {latest?.next_maintenance || "10 Nov 2025"}</li>
          <li>
            Health Status:{" "}
            <span className="text-foreground font-semibold">
              {latest?.health_status || "Stable"}
            </span>
          </li>
          <li>
            Predicted Maintenance Alert:{" "}
            {latest?.predicted_failure_risk > 0.7 ? (
              <span className="text-red-500 font-semibold">High Risk</span>
            ) : (
              <span className="text-green-500 font-semibold">Normal</span>
            )}
          </li>
        </ul>
      </div>
    </main>
  );
}

function HealthCard({ label, value, color }) {
  const colorMap = {
    green: "bg-green-100 text-green-700 border-green-300",
    blue: "bg-blue-100 text-blue-700 border-blue-300",
    orange: "bg-orange-100 text-orange-700 border-orange-300",
    purple: "bg-purple-100 text-purple-700 border-purple-300",
  };

  return (
    <div className={`p-3 rounded-lg border ${colorMap[color]} text-center`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
