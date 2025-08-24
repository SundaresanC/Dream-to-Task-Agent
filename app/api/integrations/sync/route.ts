import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { dbOperations } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session")?.value
    const userId = await requireAuth(sessionId)

    const body = await request.json()
    const { integrationId } = body

    if (!integrationId) {
      return NextResponse.json(
        { error: "Integration ID is required" },
        { status: 400 }
      )
    }

    // Update last sync timestamp
    const integration = await dbOperations.updateIntegration(integrationId, {
      lastSync: new Date(),
    })

    return NextResponse.json(integration)
  } catch (error) {
    console.error("Integration sync error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
