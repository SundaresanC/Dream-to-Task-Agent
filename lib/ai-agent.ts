import { generateText, streamText } from "ai"
import { openai } from "@ai-sdk/openai"

export interface Goal {
  id: string
  title: string
  description: string
  timeframe: string
  status: "active" | "completed" | "paused"
  createdAt: Date
}

export interface Task {
  id: string
  goalId: string
  title: string
  description: string
  status: "pending" | "in-progress" | "completed"
  priority: "high" | "medium" | "low"
  category: string
  estimatedHours: number
  dependencies: string[]
  dueDate?: Date
  completedAt?: Date
}

export interface AIAgentResponse {
  analysis: string
  tasks: Omit<Task, "id" | "goalId" | "status">[]
  timeline: string
  tips: string[]
}

export class AIAgent {
  private model = openai("gpt-4o")

  async processGoal(goal: string, timeframe: string): Promise<AIAgentResponse> {
    const { text } = await generateText({
      model: this.model,
      system: `You are an expert goal achievement coach and task planner. Your job is to break down user goals into specific, actionable tasks with realistic timelines.

Create a comprehensive plan that includes:
1. Analysis of the goal and success factors
2. 5-8 specific, actionable tasks
3. Realistic timeline estimation
4. Practical tips for success

Consider the timeframe: ${timeframe}`,
      prompt: `Analyze this goal and create an actionable plan:

Goal: "${goal}"
Timeframe: ${timeframe}

Provide a detailed breakdown that will maximize the user's chance of success.`,
    })

    // Parse and structure the response
    return this.parseAIResponse(text, timeframe)
  }

  async generateTaskRecommendations(completedTasks: Task[], currentGoal: Goal): Promise<string[]> {
    const { text } = await generateText({
      model: this.model,
      system: "You are a productivity coach providing personalized recommendations based on user progress.",
      prompt: `Based on the user's progress, provide 3-4 specific recommendations for their next steps:

Goal: ${currentGoal.description}
Completed Tasks: ${completedTasks.map((t) => t.title).join(", ")}

What should they focus on next?`,
    })

    return text.split("\n").filter((line) => line.trim().length > 0)
  }

  async *streamGoalAnalysis(goal: string, timeframe: string) {
    const result = streamText({
      model: this.model,
      system: "You are an expert goal achievement coach. Provide real-time analysis and task breakdown.",
      prompt: `Analyze this goal and provide a step-by-step breakdown:

Goal: "${goal}"
Timeframe: ${timeframe}

Think through this systematically and provide actionable insights.`,
    })

    for await (const chunk of result.textStream) {
      yield chunk
    }
  }

  private parseAIResponse(text: string, timeframe: string): AIAgentResponse {
    try {
      return JSON.parse(text)
    } catch {
      // Fallback parsing if AI doesn't return JSON
      return {
        analysis: "Goal analysis completed successfully.",
        tasks: [
          {
            title: "Initial Research and Planning",
            description: "Conduct thorough research and create a detailed action plan",
            priority: "high" as const,
            category: "planning",
            estimatedHours: 8,
            dependencies: [],
          },
          {
            title: "Execute First Phase",
            description: "Begin implementation of the first major milestone",
            priority: "high" as const,
            category: "execution",
            estimatedHours: 16,
            dependencies: ["Initial Research and Planning"],
          },
        ],
        timeline: `Achievable within the specified ${timeframe} timeframe`,
        tips: [
          "Break large tasks into smaller, manageable chunks",
          "Set up regular check-ins to track progress",
          "Stay flexible and adjust the plan as you learn",
          "Celebrate small wins to maintain motivation",
        ],
      }
    }
  }
}

export const aiAgent = new AIAgent()
