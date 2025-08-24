import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { dbOperations } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const content = await dbOperations.getAllAppContent()
    
    // Transform to key-value pairs
    const contentMap: { [key: string]: string } = {}
    content.forEach((item: any) => {
      contentMap[item.key] = item.value
    })

    return NextResponse.json({
      success: true,
      content: {
        appName: contentMap.appName || "Dream-to-Task Agent",
        tagline: contentMap.tagline || "Transform your dreams into actionable tasks",
        welcomeMessage: contentMap.welcomeMessage || "Welcome to your personal goal management system",
        dashboardTitle: contentMap.dashboardTitle || "Dashboard",
        goalsTitle: contentMap.goalsTitle || "Goals",
        tasksTitle: contentMap.tasksTitle || "Tasks",
        settingsTitle: contentMap.settingsTitle || "Settings",
        integrationsTitle: contentMap.integrationsTitle || "Integrations",
        ...contentMap,
      },
    })
  } catch (error) {
    console.error("Content GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session")?.value
    const userId = await requireAuth(sessionId)

    const body = await request.json()
    const { content } = body

    if (!content || typeof content !== "object") {
      return NextResponse.json(
        { error: "Content object is required" },
        { status: 400 }
      )
    }

    // Update multiple content items
    for (const [key, value] of Object.entries(content)) {
      await dbOperations.updateAppContent(key, value as string)
    }

    return NextResponse.json({
      success: true,
      message: "Content updated successfully",
    })
  } catch (error) {
    console.error("Content POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
