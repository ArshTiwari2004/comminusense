"use client";

import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import { RequireAuth } from "@/hooks/use-auth";
import RequireRole from "@/components/auth/RoleCheck";
import KpiCard from "@/components/ui/kpi-card";
import LineChart from "@/components/charts/line-chart";
import { useTelemetryStream } from "@/hooks/use-telemetry";

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
  const { latest, history } = useTelemetryStream({}); // plant aggregate stream
  const kwhPerTon =
    latest?.metric?.power_kw && latest?.metric?.load_tph
      ? (latest.metric.power_kw / latest.metric.load_tph).toFixed(2)
      : "--";

  return (
    <main className="p-4 space-y-4">
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard
          label="kWh/ton (live)"
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

      <section className="grid grid-cols-1 gap-4">
        <div>
          <h2 className="mb-2 text-sm text-muted-foreground">
            Live Power (kW)
          </h2>
          <LineChart data={history} xKey="t" yKey="value" />
        </div>
      </section>
    </main>
  );
}
