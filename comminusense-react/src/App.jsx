import { Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import Operations from "./pages/Operations.jsx"
import TwinLab from "./pages/TwinLab.jsx"
import Maintenance from "./pages/Maintenance.jsx"
import Scheduling from "./pages/Scheduling.jsx"
import Admin from "./pages/Admin.jsx"
import Layout from "./components/Layout.jsx"
import { ProtectedRoute } from "./components/ProtectedRoute.jsx"

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="operations" element={<Operations />} />
        <Route path="twin-lab" element={<TwinLab />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="scheduling" element={<Scheduling />} />
        <Route path="admin" element={<Admin />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
