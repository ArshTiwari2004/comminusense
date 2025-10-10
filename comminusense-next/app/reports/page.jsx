"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { RequireAuth } from "@/hooks/use-auth";
import {
  Search,
  FileText,
  FileSpreadsheet,
  FileDown,
  Calendar,
  SlidersHorizontal,
} from "lucide-react";

export default function ReportsPage() {
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");

  const reports = [
    {
      id: 1,
      name: "Energy Efficiency Summary",
      type: "CSV",
      date: "2025-10-10",
      desc: "Daily summary of power consumption and energy per ton of ore processed.",
    },
    {
      id: 2,
      name: "Predictive Maintenance Report",
      type: "PDF",
      date: "2025-10-08",
      desc: "Predicted wear and maintenance schedule based on AI models.",
    },
    {
      id: 3,
      name: "Ore Hardness & Feed Size Analysis",
      type: "XLSX",
      date: "2025-10-05",
      desc: "Comparison of feed size and ore hardness vs energy consumption.",
    },
    {
      id: 4,
      name: "Renewable Energy Utilization Log",
      type: "CSV",
      date: "2025-10-03",
      desc: "Integration statistics for solar and wind energy in operations.",
    },
    {
      id: 5,
      name: "Real-Time Equipment Load Data",
      type: "PDF",
      date: "2025-10-01",
      desc: "Continuous monitoring report for crushers and grinding mills.",
    },
    {
      id: 6,
      name: "Carbon Emission Comparison",
      type: "XLSX",
      date: "2025-09-29",
      desc: "Carbon footprint data before and after optimization deployment.",
    },
  ];

  const filteredReports = reports.filter(
    (r) =>
      (filterType === "All" || r.type === filterType) &&
      r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function handleDownload(type, name) {
    alert(`Downloading ${name} as ${type}...`);
  }

  return (
    <main className="p-6 space-y-6">
      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-[var(--panel)] w-full sm:w-[300px]">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search reports..."
            className="bg-transparent outline-none text-sm w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-[var(--panel)]">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <select className="bg-transparent outline-none text-sm text-muted-foreground">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Custom Range</option>
            </select>
          </div>

          <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-[var(--panel)]">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            <select
              className="bg-transparent outline-none text-sm text-muted-foreground"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="All">All Formats</option>
              <option value="CSV">CSV</option>
              <option value="PDF">PDF</option>
              <option value="XLSX">XLSX</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="rounded-xl border border-border bg-[var(--panel)] p-4 flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {report.type === "CSV" && (
                    <FileText className="w-5 h-5 text-blue-500" />
                  )}
                  {report.type === "PDF" && (
                    <FileDown className="w-5 h-5 text-red-500" />
                  )}
                  {report.type === "XLSX" && (
                    <FileSpreadsheet className="w-5 h-5 text-green-500" />
                  )}
                  <h3 className="text-sm font-semibold">{report.name}</h3>
                </div>
                <span className="text-xs text-muted-foreground">
                  {report.date}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                {report.desc}
              </p>
            </div>

            <div className="flex items-center justify-between mt-2">
              <button
                onClick={() => handleDownload(report.type, report.name)}
                className="px-3 py-1.5 text-xs rounded-md bg-[var(--brand)] text-[var(--on-brand)] hover:opacity-90"
              >
                Download {report.type}
              </button>
              <button className="px-3 py-1.5 text-xs rounded-md border hover:bg-[var(--hover)]">
                Preview
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Report Section */}
      <div className="rounded-lg border border-border bg-[var(--panel)] p-4 mt-8">
        <div className="text-sm text-muted-foreground mb-2">
          Generate On-Demand Reports
        </div>
        <button
          onClick={exportCsv}
          className="px-4 py-2 rounded-md bg-[var(--brand)] text-[var(--on-brand)] hover:opacity-90 cursor-pointer text-sm"
        >
          Export Energy Summary (CSV)
        </button>
      </div>
    </main>
  );

  function exportCsv() {
    const rows = [
      ["timestamp", "power_kw", "load_tph", "kwh_per_ton"],
      [new Date().toISOString(), 120.5, 55.2, (120.5 / 55.2).toFixed(2)],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "energy_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
}
