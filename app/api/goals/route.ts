import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { dbOperations } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session")?.value
    const userId = await requireAuth(sessionId)

    const goals = await dbOperations.getGoalsByUserId(userId)
    return NextResponse.json(goals)
  } catch (error) {
    console.error("Goals GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session")?.value
    const userId = await requireAuth(sessionId)

    const body = await request.json()
    const { title, description, category, priority, targetDate, timeframe } = body

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      )
    }

    const goal = await dbOperations.createGoal({
      userId,
      title,
      description,
      timeframe: timeframe || "3-months", // Default timeframe if not provided
      category: category || "personal",
      priority: priority || "medium",
      targetDate: targetDate ? new Date(targetDate) : undefined,
      aiAnalysis: "AI analysis will be generated when processed",
    })

    return NextResponse.json(goal)
  } catch (error) {
    console.error("Goals POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
