import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { dbOperations } from "@/lib/database"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = request.cookies.get("session")?.value
    const userId = await requireAuth(sessionId)

    const integrationId = params.id

    // Update integration status to disconnected instead of deleting
    const integration = await dbOperations.updateIntegration(integrationId, {
      status: "disconnected",
      lastSync: null,
    })

    return NextResponse.json(integration)
  } catch (error) {
    console.error("Integration disconnect error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
