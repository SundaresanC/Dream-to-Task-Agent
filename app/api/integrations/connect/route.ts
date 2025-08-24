import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { dbOperations } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session")?.value
    const userId = await requireAuth(sessionId)

    const body = await request.json()
    const { platformId } = body

    if (!platformId) {
      return NextResponse.json(
        { error: "Platform ID is required" },
        { status: 400 }
      )
    }

    // Check if integration already exists
    const existingIntegration = await dbOperations.getIntegrationByPlatformId(
      userId,
      platformId
    )

    if (existingIntegration) {
      // Update existing integration
      const updatedIntegration = await dbOperations.updateIntegration(
        existingIntegration._id.toString(),
        {
          status: "connected",
          lastSync: new Date(),
        }
      )
      return NextResponse.json(updatedIntegration)
    } else {
      // Create new integration
      const integration = await dbOperations.createIntegration({
        userId,
        platformId,
        platformName: platformId, // You might want to map this to a proper name
        status: "connected",
        lastSync: new Date(),
      })
      return NextResponse.json(integration)
    }
  } catch (error) {
    console.error("Integration connect error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
