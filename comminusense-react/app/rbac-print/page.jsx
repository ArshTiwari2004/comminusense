"use client";

export default function RbacPrint() {
  return (
    <div className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <h1 className="text-4xl font-bold mb-8 text-center">
        RBAC Roles & Permissions ( just for reference )
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* OPERATOR */}
        <div className="p-6 border rounded-lg bg-white shadow">
          <h2 className="text-2xl font-semibold mb-4">OPERATOR</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>telemetry.read</li>
            <li>telemetry.stream</li>
          </ul>
        </div>

        {/* SUPERVISOR */}
        <div className="p-6 border rounded-lg bg-white shadow">
          <h2 className="text-2xl font-semibold mb-4">SUPERVISOR</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>telemetry.read</li>
            <li>telemetry.stream</li>
            <li>recommendation.apply</li>
          </ul>
        </div>

        {/* PROCESS_ENGINEER */}
        <div className="p-6 border rounded-lg bg-white shadow">
          <h2 className="text-2xl font-semibold mb-4">PROCESS_ENGINEER</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>telemetry.read</li>
            <li>telemetry.stream</li>
            <li>simulation.run</li>
            <li>report.export</li>
          </ul>
        </div>

        {/* MAINTENANCE */}
        <div className="p-6 border rounded-lg bg-white shadow">
          <h2 className="text-2xl font-semibold mb-4">MAINTENANCE</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>telemetry.read</li>
            <li>maintenance.create</li>
            <li>report.export</li>
          </ul>
        </div>

        {/* PLANT_MANAGER */}
        <div className="p-6 border rounded-lg bg-white shadow">
          <h2 className="text-2xl font-semibold mb-4">PLANT_MANAGER</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>telemetry.read</li>
            <li>report.export</li>
            <li>audit.read</li>
          </ul>
        </div>

        {/* NMDC_ADMIN */}
        <div className="p-6 border rounded-lg bg-white shadow">
          <h2 className="text-2xl font-semibold mb-4">NMDC_ADMIN</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>telemetry.read</li>
            <li>telemetry.stream</li>
            <li>simulation.run</li>
            <li>recommendation.apply</li>
            <li>maintenance.create</li>
            <li>user.manage</li>
            <li>audit.read</li>
            <li>report.export</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
