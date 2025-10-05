import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar.jsx"
import Topbar from "./Topbar.jsx"

export default function Layout() {
  return (
    <div className="h-full flex bg-[rgb(var(--muted))]">
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
