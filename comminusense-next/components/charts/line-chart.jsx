"use client"

import { LineChart as RLineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

export default function LineChart({ data, xKey = "t", yKey = "value", color = "var(--brand)" }) {
  return (
    <div className="rounded-lg border border-border bg-[var(--panel)] p-2">
      <div className="h-64 w-full">
        <ResponsiveContainer>
          <RLineChart data={data}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey={xKey} stroke="var(--muted-foreground)" fontSize={12} />
            <YAxis stroke="var(--muted-foreground)" fontSize={12} />
            <Tooltip />
            <Line type="monotone" dataKey={yKey} stroke={color} dot={false} strokeWidth={2} />
          </RLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
