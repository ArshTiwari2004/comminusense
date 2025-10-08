"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Cpu, Factory, Gauge, Settings, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const links = [
  { href: "/", label: "Overview", icon: Gauge, perm: "telemetry.read" },
  {
    href: "/machines/grinder_01",
    label: "Machine",
    icon: Factory,
    perm: "telemetry.read",
  },
  {
    href: "/simulation",
    label: "Simulation",
    icon: Cpu,
    perm: "simulation.run",
  },
  {
    href: "/maintenance",
    label: "Maintenance",
    icon: Activity,
    perm: "maintenance.create",
  },
  { href: "/reports", label: "Reports", icon: Settings, perm: "report.export" },
  { href: "/admin", label: "Admin", icon: Users, perm: "user.manage" },
  { href: "/rbac-print", label: "RBAC", icon: Users, perm: "user.manage" },
  {
    href: "/maintenance_alert",
    label: "Maintenance Alert",
    icon: Activity,
    perm: "maintenance.create",
  },
  {
    href: "/energy_optimizer",
    label: "Energy Optimization",
    icon: Cpu,
    perm: "simulation.run",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { hasPermission } = useAuth();

  return (
    <aside className="h-dvh w-64 border-r border-border bg-[var(--panel)] text-foreground hidden md:flex flex-col">
      <div className="h-16 flex items-center px-4 font-semibold tracking-wide">
        <span className="">ComminuSense</span>
      </div>
      <nav className="px-2 py-2 flex-1 overflow-y-auto">
        {links
          .filter((l) => hasPermission(l.perm)) // this is setting the permissions for the sidebar links
          .map((l) => {
            const Icon = l.icon;
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors
                ${
                  active
                    ? "bg-[var(--muted)] text-foreground"
                    : "text-muted-foreground hover:bg-[var(--muted)]/60 hover:text-foreground"
                }`}
              >
                <Icon size={18} />
                <span>{l.label}</span>
              </Link>
            );
          })}
      </nav>
      <div className="p-3 text-xs text-muted-foreground">v0.1 • SIH 2025</div>
    </aside>
  );
}
