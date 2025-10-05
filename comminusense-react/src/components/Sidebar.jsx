"use client";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Factory,
  Beaker,
  Wrench,
  CalendarClock,
  Users,
} from "lucide-react";
import { useAuth } from "../state/AuthContext.jsx";
import { canView } from "../lib/rbac.js";

const nav = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["operator", "engineer", "manager", "admin"],
  },
  {
    to: "/operations",
    label: "Operations",
    icon: Factory,
    roles: ["operator", "engineer", "manager", "admin"],
  },
  {
    to: "/twin-lab",
    label: "Twin Lab",
    icon: Beaker,
    roles: ["operator", "engineer", "manager", "admin"],
  },

  {
    to: "/maintenance",
    label: "Maintenance",
    icon: Wrench,
    roles: ["engineer", "manager", "admin"],
  },
  {
    to: "/scheduling",
    label: "Scheduling",
    icon: CalendarClock,
    roles: ["operator", "engineer", "manager", "admin"],
  },
  { to: "/admin", label: "Admin", icon: Users, roles: ["admin"] },
];

export default function Sidebar() {
  const { user, role } = useAuth();
  const loc = useLocation();

  console.log("User role in Sidebar:", role);

  return (
    <aside className="hidden md:flex w-60 flex-col border-r border-border bg-white">
      <div className="p-4 border-b border-border">
        <div className="text-lg font-bold">ComminuSense</div>
        <div className="text-xs text-gray-500">Energy Optimization</div>
      </div>
      <nav className="flex-1 p-2">
        {nav
          .filter((item) => canView(role, item.roles))
          .map((item) => {
            const Icon = item.icon;
            const active = loc.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-md px-3 py-2 cursor-pointer transition-colors ${
                  active
                    ? "bg-[rgb(var(--brand-600))] text-white"
                    : "hover:bg-[rgb(var(--muted))]"
                }`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            );
          })}
      </nav>
      <div className="p-4 border-t border-border">
        <div className="text-xs text-gray-500">
          {user ? `Signed in as ${user.email}` : "Not signed in"}
        </div>
      </div>
    </aside>
  );
}
