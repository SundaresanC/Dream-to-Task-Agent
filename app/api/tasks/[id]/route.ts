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

    const taskId = params.id
    const task = await dbOperations.getTaskById(taskId)

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    if (task.userId.toString() !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("Task GET error:", error)
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

    const taskId = params.id
    const body = await request.json()
    const {
      title,
      description,
      priority,
      category,
      estimatedHours,
      dueDate,
      status,
      progress,
    } = body

    // Verify task exists and belongs to user
    const existingTask = await dbOperations.getTaskById(taskId)
    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    if (existingTask.userId.toString() !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update task
    const updates: any = {}
    if (title !== undefined) updates.title = title
    if (description !== undefined) updates.description = description
    if (priority !== undefined) updates.priority = priority
    if (category !== undefined) updates.category = category
    if (estimatedHours !== undefined) updates.estimatedHours = estimatedHours
    if (dueDate !== undefined) updates.dueDate = dueDate ? new Date(dueDate) : null
    if (status !== undefined) updates.status = status
    if (progress !== undefined) updates.progress = progress
    if (status === "completed") updates.completedAt = new Date()

    const task = await dbOperations.updateTask(taskId, updates)
    return NextResponse.json(task)
  } catch (error) {
    console.error("Task PUT error:", error)
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

    const taskId = params.id

    // Verify task exists and belongs to user
    const existingTask = await dbOperations.getTaskById(taskId)
    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    if (existingTask.userId.toString() !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Delete task
    await dbOperations.deleteTask(taskId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Task DELETE error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
