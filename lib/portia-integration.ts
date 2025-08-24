/**
 * Portia Integration Layer
 * Provides TypeScript interfaces and utilities for working with Portia AI agents
 */

export interface PortiaGoalAnalysis {
  complexity_level: "beginner" | "intermediate" | "advanced"
  feasibility_score: number
  key_challenges: string[]
  required_resources: string[]
}

export interface PortiaTask {
  title: string
  description: string
  priority: "low" | "medium" | "high"
  estimated_hours: number
  category: string
  dependencies?: string[]
  status?: "pending" | "in_progress" | "completed"
}

export interface PortiaTimeline {
  total_duration_days: number
  total_estimated_hours: number
  hours_per_week: number
  weekly_schedule: Array<{
    week: number
    start_date: string
    tasks: string[]
    focus_area: string
  }>
  milestones: Array<{
    date: string
    title: string
    description: string
  }>
}

export interface PortiaProcessResult {
  success: boolean
  plan_id?: string
  run_id?: string
  user_id?: string
  analysis: PortiaGoalAnalysis
  tasks: PortiaTask[]
  timeline: PortiaTimeline
  success_tips: string[]
  potential_obstacles: Array<{
    obstacle: string
    mitigation: string
  }>
  processed_at?: string
  error?: string
  fallback_analysis?: any
}

export class PortiaClient {
  private baseUrl: string

  constructor(baseUrl = "/api/portia") {
    this.baseUrl = baseUrl
  }

  async processGoal(goal: string, timeframe: string, userContext?: Record<string, any>): Promise<PortiaProcessResult> {
    const response = await fetch(`${this.baseUrl}/process-goal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        goal,
        timeframe,
        userContext,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to process goal: ${response.statusText}`)
    }

    return response.json()
  }

  async generateSchedule(tasks: PortiaTask[], preferences: Record<string, any>): Promise<any> {
    const response = await fetch(`${this.baseUrl}/generate-schedule`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tasks,
        preferences,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to generate schedule: ${response.statusText}`)
    }

    return response.json()
  }

  async executePlan(planId: string, executionOptions?: Record<string, any>): Promise<any> {
    const response = await fetch(`${this.baseUrl}/execute-plan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        planId,
        executionOptions,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to execute plan: ${response.statusText}`)
    }

    return response.json()
  }
}

// Utility functions for working with Portia data
export const PortiaUtils = {
  calculateTotalEffort: (tasks: PortiaTask[]): number => {
    return tasks.reduce((total, task) => total + task.estimated_hours, 0)
  },

  groupTasksByCategory: (tasks: PortiaTask[]): Record<string, PortiaTask[]> => {
    return tasks.reduce(
      (groups, task) => {
        const category = task.category || "uncategorized"
        if (!groups[category]) {
          groups[category] = []
        }
        groups[category].push(task)
        return groups
      },
      {} as Record<string, PortiaTask[]>,
    )
  },

  prioritizeTasks: (tasks: PortiaTask[]): PortiaTask[] => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return [...tasks].sort((a, b) => {
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  },

  formatTimelineForCalendar: (timeline: PortiaTimeline) => {
    return timeline.weekly_schedule.map((week) => ({
      id: `week-${week.week}`,
      title: `Week ${week.week}: ${week.focus_area}`,
      start: week.start_date,
      end: new Date(new Date(week.start_date).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      description: `Tasks: ${week.tasks.join(", ")}`,
      category: week.focus_area,
    }))
  },
}
