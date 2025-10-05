"use client";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../state/AuthContext.jsx";
import { LogOut } from "lucide-react";

export default function Topbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();

  const title = {
    "/dashboard": "Dashboard",
    "/operations": "Operations",
    "/twin-lab": "Twin Lab",
    "/maintenance": "Maintenance",
    "/scheduling": "Renewable Scheduling",
    "/admin": "Admin",
  }[Object.keys(titleMap(loc.pathname))[0]]; // fallback handled below

  function titleMap(path) {
    return {
      "/dashboard": path.startsWith("/dashboard"),
      "/operations": path.startsWith("/operations"),
      "/twin-lab": path.startsWith("/twin-lab"),
      "/maintenance": path.startsWith("/maintenance"),
      "/scheduling": path.startsWith("/scheduling"),
      "/admin": path.startsWith("/admin"),
    };
  }

  return (
    <header className="flex items-center justify-between border-b border-border bg-white px-4 py-3">
      <div>
        <h1 className="text-lg font-semibold">{title || "ComminuSense"}</h1>
        <p className="text-xs text-gray-500">
          Minimize kWh/t while maintaining throughput
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="btn btn-primary"
          onClick={() => navigate("/twin-lab")}
        >
          Open Twin Lab
        </button>
        <button className="btn btn-ghost" title="Sign out" onClick={signOut}>
          <LogOut size={18} /> Sign out
        </button>
      </div>
    </header>
  );
}
