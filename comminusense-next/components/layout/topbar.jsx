"use client"

import { signOut } from "@/components/auth/firebase"
import { useAuth } from "@/hooks/use-auth"

export default function Topbar() {
  const { user } = useAuth()
  return (
    <header
      className="h-16 flex items-center justify-between px-4 border-b border-border bg-[linear-gradient(90deg,var(--panel),rgba(0,0,0,0))]"
      role="banner"
    >
      <h1 className="text-sm md:text-base text-pretty text-muted-foreground">
        Smart comminution — lower kWh/ton, better uptime
      </h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">{user?.email}</span>
        <button
          onClick={() => signOut()}
          className="px-3 py-1.5 rounded-md bg-[var(--brand)] text-[var(--on-brand)] hover:opacity-90 cursor-pointer text-sm"
          aria-label="Sign out"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
