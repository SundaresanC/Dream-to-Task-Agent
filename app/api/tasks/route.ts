import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { dbOperations } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session")?.value
    const userId = await requireAuth(sessionId)

    const tasks = await dbOperations.getTasksByUserId(userId)
    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Tasks GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session")?.value
    const userId = await requireAuth(sessionId)

    const body = await request.json()
    const {
      title,
      description,
      priority,
      category,
      estimatedHours,
      dueDate,
      goalId,
      dependencies,
      tags,
    } = body

    if (!title || !description || !category) {
      return NextResponse.json(
        { error: "Title, description, and category are required" },
        { status: 400 }
      )
    }

    const task = await dbOperations.createTask({
      goalId: goalId || "default-goal",
      userId,
      title,
      description,
      priority: priority || "medium",
      category,
      estimatedHours: estimatedHours || 0,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      dependencies: dependencies || [],
      tags: tags || [],
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error("Tasks POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session")?.value
    const userId = await requireAuth(sessionId)

    const body = await request.json()
    const { taskId, status, progress } = body

    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 })
    }

    const updates: any = {}
    if (status !== undefined) updates.status = status
    if (progress !== undefined) updates.progress = progress
    if (status === "completed") updates.completedAt = new Date()

    const task = await dbOperations.updateTask(taskId, updates)
    return NextResponse.json(task)
  } catch (error) {
    console.error("Tasks PATCH error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
