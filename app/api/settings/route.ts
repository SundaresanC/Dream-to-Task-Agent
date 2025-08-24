import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { dbOperations } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session")?.value
    const userId = await requireAuth(sessionId)

    const preferences = await dbOperations.getUserPreferences(userId)
    return NextResponse.json({
      success: true,
      preferences: preferences || {
        theme: "system",
        notifications: true,
        emailUpdates: false,
        language: "en",
        timezone: "UTC",
        dateFormat: "MM/DD/YYYY",
        timeFormat: "12h",
        taskView: "list",
        goalView: "grid",
        autoSync: true,
        privacyMode: false,
      },
    })
  } catch (error) {
    console.error("Settings GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session")?.value
    const userId = await requireAuth(sessionId)

    const { preferences } = await request.json()

    if (!preferences) {
      return NextResponse.json(
        { error: "Preferences data is required" },
        { status: 400 }
      )
    }

    await dbOperations.updateUserPreferences(userId, preferences)

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
    })
  } catch (error) {
    console.error("Settings POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
