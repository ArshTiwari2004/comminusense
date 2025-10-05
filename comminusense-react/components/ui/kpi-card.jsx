"use client"

export default function KpiCard({ label, value, delta, help }) {
  const positive = (delta ?? 0) >= 0
  return (
    <div className="rounded-lg border border-border bg-[var(--panel)] p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {delta !== undefined && (
        <div className={`mt-1 text-xs ${positive ? "text-[var(--success)]" : "text-[var(--destructive)]"}`}>
          {positive ? "▲" : "▼"} {Math.abs(delta)}%
        </div>
      )}
      {help && <div className="mt-2 text-xs text-muted-foreground">{help}</div>}
    </div>
  )
}
