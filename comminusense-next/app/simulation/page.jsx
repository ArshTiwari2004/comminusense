"use client";

import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { RequireAuth, useAuth } from "@/hooks/use-auth";
import useSWR from "swr";
import { useState, useEffect } from "react";
import LineChart from "@/components/charts/line-chart";

const fetcher = (url, body) =>
  fetch(url, { ...body, headers: { "Content-Type": "application/json" } }).then(
    (r) => r.json()
  );

export default function SimulationPage() {
  return (
    <RequireAuth>
      <div className="min-h-dvh bg-background text-foreground flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <Content />
        </div>
      </div>
    </RequireAuth>
  );
}

function Content() {
  const { hasPermission } = useAuth();
  const defaultParams = {
    rpm: 315,
    load_tph: 55,
    moisture_pct: 3,
    horizon: 60,
  };
  const [params, setParams] = useState(defaultParams);
  const [scenario, setScenario] = useState("Custom");

  const { data, mutate, isLoading } = useSWR(
    hasPermission("simulation.run") ? ["/api/simulate/run", params] : null,
    ([url, p]) => fetcher(url, { method: "POST", body: JSON.stringify(p) }),
    { revalidateOnFocus: false }
  );

  const handleReset = () => {
    setParams(defaultParams);
    setScenario("Custom");
  };

  const handleScenario = (s) => {
    setScenario(s);
    switch (s) {
      case "Dry Ore":
        setParams({ rpm: 320, load_tph: 50, moisture_pct: 1, horizon: 60 });
        break;
      case "Wet Ore":
        setParams({ rpm: 300, load_tph: 45, moisture_pct: 6, horizon: 60 });
        break;
      case "High Load":
        setParams({ rpm: 350, load_tph: 80, moisture_pct: 3, horizon: 60 });
        break;
      default:
        setParams(defaultParams);
    }
  };

  const exportCSV = () => {
    if (!data?.timeseries) return;
    const headers = Object.keys(data.timeseries[0]).join(",");
    const rows = data.timeseries
      .map((d) => Object.values(d).join(","))
      .join("\n");
    const blob = new Blob([headers + "\n" + rows], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "simulation_results.csv";
    link.click();
  };

  return (
    <main className="p-4 space-y-6">
      {/* Simulation Controls */}
      <div className="rounded-lg border border-border bg-[var(--panel)] p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            Simulation Controls
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1 text-xs rounded-md bg-gray-200 hover:bg-gray-300"
            >
              Reset
            </button>
            <select
              value={scenario}
              onChange={(e) => handleScenario(e.target.value)}
              className="px-2 py-1 text-xs border rounded-md"
            >
              <option>Custom</option>
              <option>Dry Ore</option>
              <option>Wet Ore</option>
              <option>High Load</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Slider
            label="RPM"
            min={200}
            max={400}
            value={params.rpm}
            onChange={(v) => setParams((s) => ({ ...s, rpm: v }))}
          />
          <Slider
            label="Load (t/h)"
            min={20}
            max={120}
            value={params.load_tph}
            onChange={(v) => setParams((s) => ({ ...s, load_tph: v }))}
          />
          <Slider
            label="Moisture (%)"
            min={0}
            max={10}
            value={params.moisture_pct}
            onChange={(v) => setParams((s) => ({ ...s, moisture_pct: v }))}
          />
          <Slider
            label="Horizon (s)"
            min={15}
            max={240}
            value={params.horizon}
            onChange={(v) => setParams((s) => ({ ...s, horizon: v }))}
          />
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => mutate()}
            className="px-3 py-2 rounded-md bg-[var(--brand)] text-[var(--on-brand)] hover:opacity-90 cursor-pointer"
          >
            Run Simulation
          </button>
          <button
            onClick={exportCSV}
            className="px-3 py-2 rounded-md bg-green-600 text-white hover:opacity-90 cursor-pointer disabled:opacity-50"
          >
            Export CSV
          </button>
        </div>

        {isLoading && (
          <div className="mt-2 text-sm text-muted-foreground">
            Running simulation...
          </div>
        )}
      </div>

      {/* Simulation Results */}
      {data && (
        <div className="grid grid-cols-1 gap-6">
          <div className="rounded-lg border border-border bg-[var(--panel)] p-4">
            <h3 className="text-sm text-muted-foreground mb-2">
              Power (kW) — simulated
            </h3>
            <LineChart
              data={
                data.timeseries?.map((d) => ({
                  t: d.t,
                  power: d.power_kw,
                  efficiency: d.efficiency_pct,
                  temperature: d.temperature_c,
                })) || []
              }
            />
          </div>

          <div className="rounded-lg border border-border bg-[var(--panel)] p-4 text-sm">
            <div className="font-semibold mb-2">KPI Summary</div>
            <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
              <li>
                Average kWh/ton:{" "}
                <span className="text-foreground">
                  {data.kpi?.kwh_per_ton?.toFixed(2)}
                </span>
              </li>
              <li>
                Avg Power (kW):{" "}
                <span className="text-foreground">
                  {data.kpi?.avg_power_kw?.toFixed(1)}
                </span>
              </li>
              <li>
                Throughput (t/h):{" "}
                <span className="text-foreground">
                  {data.kpi?.load_tph?.toFixed(1)}
                </span>
              </li>
              <li>
                Efficiency (%):{" "}
                <span className="text-foreground">
                  {data.kpi?.efficiency_pct?.toFixed(1)}
                </span>
              </li>
              <li>
                Peak Power (kW):{" "}
                <span className="text-foreground">
                  {data.kpi?.peak_power_kw?.toFixed(1)}
                </span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}

function Slider({ label, value, min, max, onChange }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1">
        {label}: <span className="text-foreground">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer"
      />
    </div>
  );
}
