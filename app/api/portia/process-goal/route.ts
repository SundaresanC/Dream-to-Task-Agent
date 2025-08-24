import { type NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"

export async function POST(request: NextRequest) {
  let goal: string
  let timeframe: string
  let userContext: any

  try {
    const requestData = await request.json()
    goal = requestData.goal
    timeframe = requestData.timeframe
    userContext = requestData.userContext

    if (!goal || !timeframe) {
      return NextResponse.json({ error: "Goal and timeframe are required" }, { status: 400 })
    }

    console.log("[v0] Processing goal with Portia:", { goal, timeframe, userContext })

    // Extract user ID from context or use default
    const userId = userContext?.userId || userContext?.user_id || "default-user"
    const enableCloudLogging = process.env.PORTIA_API_KEY ? true : false

    // Execute enhanced Portia Python script
    const result = await executePortiaScript(goal, timeframe, userId, enableCloudLogging)

    console.log("[v0] Portia processing completed successfully")
    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error processing goal with Portia:", error)

    const fallbackResult = {
      success: true,
      fallback: true,
      analysis: {
        complexity_level: "intermediate",
        feasibility_score: 0.75,
        key_challenges: ["planning", "time management", "consistency"],
        required_resources: ["time", "effort", "learning materials"],
      },
      tasks: [
        {
          title: "Define specific objectives",
          description: "Break down the goal into specific, measurable objectives",
          priority: "high",
          category: "planning",
          estimated_hours: 2,
        },
        {
          title: "Research and gather resources",
          description: "Identify and collect necessary resources and information",
          priority: "high",
          category: "research",
          estimated_hours: 4,
        },
        {
          title: "Create detailed action plan",
          description: "Develop step-by-step action plan with deadlines",
          priority: "high",
          category: "planning",
          estimated_hours: 3,
        },
        {
          title: "Begin execution",
          description: "Start working on the first actionable steps",
          priority: "medium",
          category: "execution",
          estimated_hours: 8,
        },
        {
          title: "Monitor and adjust",
          description: "Track progress and make necessary adjustments",
          priority: "medium",
          category: "monitoring",
          estimated_hours: 2,
        },
      ],
      timeline: {
        total_duration_days: timeframe?.includes("week") ? 7 : timeframe?.includes("month") ? 30 : 90,
        total_estimated_hours: 19,
        hours_per_week: 5,
        milestones: [
          {
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            title: "Week 1 Review",
            description: "Review initial progress and adjust plan",
          },
          {
            date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            title: "Week 2 Review",
            description: "Mid-point evaluation and course correction",
          },
          {
            date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
            title: "Week 3 Review",
            description: "Final sprint preparation",
          },
          {
            date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            title: "Final Review",
            description: "Goal completion assessment",
          },
        ],
      },
      success_tips: [
        "Break large tasks into smaller, manageable chunks",
        "Set up regular progress check-ins and reviews",
        "Celebrate small wins along the way",
        "Build accountability through sharing progress with others",
        "Prepare for setbacks and have contingency plans",
      ],
      potential_obstacles: [
        {
          obstacle: "Lack of motivation over time",
          mitigation: "Set up reward systems and track visible progress",
        },
        {
          obstacle: "Time constraints",
          mitigation: "Schedule dedicated time blocks and protect them",
        },
        {
          obstacle: "Skill gaps",
          mitigation: "Identify learning resources early and allocate time for skill building",
        },
      ],
    }

    console.log("[v0] Returning fallback result due to Portia error")
    return NextResponse.json(fallbackResult)
  }
}

function executePortiaScript(goal: string, timeframe: string, userId: string, enableCloudLogging: boolean): Promise<any> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), "scripts", "portia_agent.py")
    const args = [scriptPath, goal, timeframe, userId, enableCloudLogging.toString()]

    console.log("[v0] Executing enhanced Python script:", { scriptPath, args })

    const pythonCommands = ["python3", "python", "py"]
    let currentCommandIndex = 0

    function tryNextPythonCommand() {
      if (currentCommandIndex >= pythonCommands.length) {
        reject(new Error("No Python interpreter found. Please install Python 3."))
        return
      }

      const pythonCmd = pythonCommands[currentCommandIndex]
      console.log("[v0] Trying Python command:", pythonCmd)

      const pythonProcess = spawn(pythonCmd, args, {
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
          currentCommandIndex++
          tryNextPythonCommand()
        }
      })

      pythonProcess.on("error", (error) => {
        console.error("[v0] Failed to start Python process:", error)
        currentCommandIndex++
        tryNextPythonCommand()
      })
    }

    tryNextPythonCommand()
  })
}
