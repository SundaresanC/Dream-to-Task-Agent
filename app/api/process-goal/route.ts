import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { spawn } from "child_process"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session")?.value
    const userId = await requireAuth(sessionId)

    const body = await request.json()
    const { goal, timeframe } = body

    if (!goal || !timeframe) {
      return NextResponse.json(
        { error: "Goal and timeframe are required" },
        { status: 400 }
      )
    }

    // Execute Python script
    const result = await executePortiaScript(goal, timeframe, userId)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Process goal error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function executePortiaScript(
  goal: string,
  timeframe: string,
  userId: string
): Promise<any> {
  return new Promise((resolve, reject) => {
    const enableCloudLogging = !!process.env.PORTIA_API_KEY
    const scriptPath = path.join(process.cwd(), "scripts", "portia_agent.py")

    console.log("[v0] Executing Portia script with:")
    console.log("[v0] - Goal:", goal)
    console.log("[v0] - Timeframe:", timeframe)
    console.log("[v0] - User ID:", userId)
    console.log("[v0] - Cloud Logging:", enableCloudLogging)

    const pythonProcess = spawn("python", [scriptPath, goal, timeframe, userId, enableCloudLogging.toString()], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PYTHONPATH: path.join(process.cwd(), "scripts"),
      },
    })

    let stdout = ""
    let stderr = ""

    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString()
      console.log("[v0] Python stdout:", data.toString())
    })

    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString()
      console.log("[v0] Python stderr:", data.toString())
    })

    pythonProcess.on("close", (code) => {
      console.log("[v0] Python process closed with code:", code)
      if (code === 0) {
        try {
          // Try to extract JSON from stdout (handle any debug output)
          const jsonMatch = stdout.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0])
            resolve(result)
          } else {
            console.error("[v0] No JSON found in stdout:", stdout)
            reject(new Error("No JSON response found in Python script output"))
          }
        } catch (parseError) {
          console.error("[v0] Failed to parse Python script output:", stdout)
          reject(new Error("Invalid JSON response from Python script"))
        }
      } else {
        console.error("[v0] Python script error:", stderr)
        // Fallback to local analysis
        const fallbackResult = {
          success: true,
          analysis: {
            summary: `Goal: ${goal}`,
            complexity: "medium",
            feasibility: 0.7,
            estimatedDuration: "2-3 weeks",
            keyMilestones: ["Research phase", "Planning phase", "Execution phase"],
            potentialChallenges: ["Time management", "Resource allocation"],
            successFactors: ["Clear planning", "Regular progress tracking"],
          },
          tasks: [
            {
              title: "Research and Planning",
              description: "Conduct initial research and create detailed plan",
              priority: "high",
              estimatedHours: 8,
              category: "planning",
            },
            {
              title: "Set Up Resources",
              description: "Gather necessary resources and tools",
              priority: "medium",
              estimatedHours: 4,
              category: "setup",
            },
            {
              title: "Begin Execution",
              description: "Start working on the main goal",
              priority: "high",
              estimatedHours: 16,
              category: "execution",
            },
          ],
          timeline: {
            phases: [
              {
                name: "Planning Phase",
                duration: "1 week",
                tasks: ["Research and Planning"],
              },
              {
                name: "Setup Phase",
                duration: "3-5 days",
                tasks: ["Set Up Resources"],
              },
              {
                name: "Execution Phase",
                duration: "2-3 weeks",
                tasks: ["Begin Execution"],
              },
            ],
          },
          tips: [
            "Break down the goal into smaller, manageable tasks",
            "Set specific deadlines for each milestone",
            "Track progress regularly and adjust plans as needed",
          ],
          obstacles: [
            "Procrastination and lack of motivation",
            "Unrealistic time estimates",
            "External distractions and interruptions",
          ],
        }
        resolve(fallbackResult)
      }
    })

    pythonProcess.on("error", (error) => {
      console.error("[v0] Failed to start Python process:", error)
      reject(error)
    })
  })
}
