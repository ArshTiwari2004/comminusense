export function canView(role, allowed) {
  if (!allowed || allowed.length === 0) return true
  if (!role) return false
  return allowed.includes(role)
}

export const roles = ["operator", "engineer", "manager", "admin"]
