let TICKETS = []

export async function GET() {
  return Response.json({ tickets: TICKETS })
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}))
  const ticket = {
    id: `${Date.now()}`,
    title: body.title || "Untitled",
    description: body.description || "",
    created_at: new Date().toISOString(),
    status: "OPEN",
  }
  TICKETS = [ticket, ...TICKETS].slice(0, 200)
  return Response.json({ ok: true, ticket })
}
