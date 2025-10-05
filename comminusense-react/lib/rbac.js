const PERMISSIONS = {
  "telemetry.read": true,
  "telemetry.stream": true,
  "simulation.run": true,
  "recommendation.apply": true,
  "maintenance.create": true,
  "user.manage": true,
  "audit.read": true,
  "report.export": true,
}

const ROLE_PERMISSIONS = {
  OPERATOR: ["telemetry.read", "telemetry.stream"],
  SUPERVISOR: ["telemetry.read", "telemetry.stream", "recommendation.apply"],
  PROCESS_ENGINEER: ["telemetry.read", "telemetry.stream", "simulation.run", "report.export"],
  MAINTENANCE: ["telemetry.read", "maintenance.create", "report.export"],
  PLANT_MANAGER: ["telemetry.read", "report.export", "audit.read"],
  NMDC_ADMIN: [
    "telemetry.read",
    "telemetry.stream",
    "simulation.run",
    "recommendation.apply",
    "maintenance.create",
    "user.manage",
    "audit.read",
    "report.export",
  ],
}

const STORAGE_KEY = "__comminusense_roles__"

function readStore() {
  if (typeof window === "undefined") return {}
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
  } catch {
    return {}
  }
}

function writeStore(data) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getUserRoles(email) {
  const db = readStore()
  return db[email] || []
}

export function setUserRoles(email, roles) {
  const db = readStore()
  db[email] = roles
  writeStore(db)
}

export function hasPermission(roles, permission) {
  const set = new Set()
  roles.forEach((r) => (ROLE_PERMISSIONS[r] || []).forEach((p) => set.add(p)))
  return set.has(permission) && PERMISSIONS[permission]
}

export const ALL_ROLES = Object.keys(ROLE_PERMISSIONS)
export const ALL_PERMISSIONS = Object.keys(PERMISSIONS)
