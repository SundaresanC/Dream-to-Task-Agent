import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { dbOperations } from "@/lib/database"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = request.cookies.get("session")?.value
    const userId = await requireAuth(sessionId)

    const goalId = params.id
    const goal = await dbOperations.getGoalById(goalId)

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 })
    }

    if (goal.userId.toString() !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json(goal)
  } catch (error) {
    console.error("Goal GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = request.cookies.get("session")?.value
    const userId = await requireAuth(sessionId)

    const goalId = params.id
    const body = await request.json()
    const { title, description, status, aiAnalysis, category, priority, targetDate, progress } = body

    // Verify goal exists and belongs to user
    const existingGoal = await dbOperations.getGoalById(goalId)
    if (!existingGoal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 })
    }

    if (existingGoal.userId.toString() !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update goal
    const updates: any = {}
    if (title !== undefined) updates.title = title
    if (description !== undefined) updates.description = description
    if (status !== undefined) updates.status = status
    if (aiAnalysis !== undefined) updates.aiAnalysis = aiAnalysis
    if (category !== undefined) updates.category = category
    if (priority !== undefined) updates.priority = priority
    if (targetDate !== undefined) updates.targetDate = targetDate ? new Date(targetDate) : null
    if (progress !== undefined) updates.progress = progress

    const goal = await dbOperations.updateGoal(goalId, updates)
    return NextResponse.json(goal)
  } catch (error) {
    console.error("Goal PUT error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = request.cookies.get("session")?.value
    const userId = await requireAuth(sessionId)

    const goalId = params.id

    // Verify goal exists and belongs to user
    const existingGoal = await dbOperations.getGoalById(goalId)
    if (!existingGoal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 })
    }

    if (existingGoal.userId.toString() !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Delete goal
    await dbOperations.deleteGoal(goalId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Goal DELETE error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
