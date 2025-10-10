"use client";

import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { RequireAuth } from "@/hooks/use-auth";
import RequireRole from "@/components/auth/RoleCheck";
import KpiCard from "@/components/ui/kpi-card";
import LineChart from "@/components/charts/line-chart";
import { useTelemetryStream } from "@/hooks/use-telemetry";
import useSWR from "swr";
import { useState } from "react";

const fetcher = (url, body) => fetch(url, body).then((r) => r.json());

export default function OverviewPage() {
  return (
    <RequireAuth>
      <RequireRole>
        <div className="min-h-dvh bg-background text-foreground flex">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Topbar />
            <Content />
          </div>
        </div>
      </RequireRole>
    </RequireAuth>
  );
}

function Content() {
  const { latest, history } = useTelemetryStream({});
  const [activeMetric, setActiveMetric] = useState("power");
  const { data: aiSummary } = useSWR(
    latest ? ["/api/models/energy/plant-summary", latest] : null,
    ([url, payload]) =>
      fetcher(url, { method: "POST", body: JSON.stringify(payload) })
  );

  const kwhPerTon =
    latest?.metric?.power_kw && latest?.metric?.load_tph
      ? (latest.metric.power_kw / latest.metric.load_tph).toFixed(2)
      : "--";

  const exportCSV = () => {
    if (!history?.length) return;
    const headers = Object.keys(history[0]).join(",");
    const rows = history.map((d) => Object.values(d).join(",")).join("\n");
    const blob = new Blob([headers + "\n" + rows], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "plant_telemetry.csv";
    link.click();
  };

  return (
    <main className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-lg font-semibold">Plant Overview</h1>
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              latest ? "bg-green-500" : "bg-red-400"
            } animate-pulse`}
            title={latest ? "Live Telemetry Active" : "Disconnected"}
          />
          <button
            onClick={exportCSV}
            className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:opacity-90 cursor-pointer"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          label="kWh/ton (Live)"
          value={kwhPerTon}
          delta={-8}
          help="vs last week baseline"
        />
        <KpiCard
          label="Throughput (t/h)"
          value={latest?.metric?.load_tph?.toFixed?.(1) ?? "--"}
          delta={3}
        />
        <KpiCard
          label="Power (kW)"
          value={latest?.metric?.power_kw?.toFixed?.(1) ?? "--"}
        />
        <KpiCard
          label="Vibration"
          value={latest?.metric?.vibration?.toFixed?.(2) ?? "--"}
        />
      </section>

      {/* Plant Health Summary */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          title="Overall Efficiency"
          value={`${latest?.metric?.efficiency?.toFixed?.(1) ?? 92}%`}
          color="green"
        />
        <SummaryCard
          title="Plant Utilization"
          value={`${latest?.metric?.utilization?.toFixed?.(1) ?? 85}%`}
          color="blue"
        />
        <SummaryCard
          title="Downtime"
          value={`${latest?.metric?.downtime_pct?.toFixed?.(1) ?? 5}%`}
          color="orange"
        />
      </section>

      {/* AI Insights */}
      {aiSummary && (
        <section className="rounded-lg border border-border bg-[var(--panel)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-muted-foreground">
                AI Insights
              </h2>
              <p className="text-xs text-muted-foreground">
                AI analyzed performance from {aiSummary.total_machines}{" "}
                machines.
              </p>
            </div>
            <button className="px-3 py-1 text-xs bg-[var(--brand)] text-[var(--on-brand)] rounded-md hover:opacity-90">
              View Details
            </button>
          </div>
          <div className="mt-2 text-sm">
            Predicted Avg. kWh/ton:{" "}
            <span className="font-semibold">
              {aiSummary.predicted_kwh_per_ton?.toFixed?.(2)}
            </span>
            {"  |  "}
            Actual Avg:{" "}
            <span className="font-semibold">
              {aiSummary.actual_kwh_per_ton?.toFixed?.(2)}
            </span>
          </div>
          <ul className="mt-2 text-sm list-disc pl-4 text-muted-foreground">
            {aiSummary.recommendations?.map((r, i) => (
              <li key={i}>
                Machine <strong>{r.machine_id}</strong>: {r.message}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Performance Trends */}
      <section className="rounded-lg border border-border bg-[var(--panel)] p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm text-muted-foreground">Performance Trends</h3>
          <div className="flex gap-2">
            {["power", "throughput", "efficiency"].map((metric) => (
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
            ))}
          </div>
        </div>
        <LineChart data={history} xKey="t" yKey={activeMetric} />
      </section>

      {/* Notifications */}
      <section className="rounded-lg border border-border bg-[var(--panel)] p-4 text-sm">
        <div className="font-semibold mb-1">System Alerts</div>
        <ul className="list-disc pl-4 text-muted-foreground space-y-1">
          <li>Vibration spike detected in Crusher-2 at 11:42 AM.</li>
          <li>Conveyor-1 efficiency dropped below 80%.</li>
          <li>Maintenance due for Machine-5 on 12 Oct 2025.</li>
        </ul>
      </section>
    </main>
  );
}

function SummaryCard({ title, value, color }) {
  const colorMap = {
    green: "bg-green-100 text-green-700 border-green-300",
    blue: "bg-blue-100 text-blue-700 border-blue-300",
    orange: "bg-orange-100 text-orange-700 border-orange-300",
  };

  return (
    <div className={`p-3 rounded-lg border ${colorMap[color]} text-center`}>
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
