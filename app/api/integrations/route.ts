import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { dbOperations } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session")?.value
    const userId = await requireAuth(sessionId)

    const integrations = await dbOperations.getIntegrationsByUserId(userId)
    return NextResponse.json(integrations)
  } catch (error) {
    console.error("Integrations GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session")?.value
    const userId = await requireAuth(sessionId)

    const body = await request.json()
    const { platformId, platformName } = body

    if (!platformId || !platformName) {
      return NextResponse.json(
        { error: "Platform ID and name are required" },
        { status: 400 }
      )
    }

    const integration = await dbOperations.createIntegration({
      userId,
      platformId,
      platformName,
      status: "disconnected",
    })

    return NextResponse.json(integration)
  } catch (error) {
    console.error("Integrations POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
