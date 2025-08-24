"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, CheckSquare, TrendingUp } from "lucide-react"

interface DashboardStats {
  totalGoals: number
  completedGoals: number
  totalTasks: number
  completedTasks: number
  successRate: number
  activeGoals: number
  pendingTasks: number
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalGoals: 0,
    completedGoals: 0,
    totalTasks: 0,
    completedTasks: 0,
    successRate: 0,
    activeGoals: 0,
    pendingTasks: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [goalsResponse, tasksResponse] = await Promise.all([
        fetch("/api/goals"),
        fetch("/api/tasks"),
      ])

      if (goalsResponse.ok && tasksResponse.ok) {
        const goalsData = await goalsResponse.json()
        const tasksData = await tasksResponse.json()

        const goals = goalsData.data || []
        const tasks = tasksData.data || []

        const totalGoals = goals.length
        const completedGoals = goals.filter((g: any) => g.status === "completed").length
        const activeGoals = goals.filter((g: any) => g.status === "active").length
        const totalTasks = tasks.length
        const completedTasks = tasks.filter((t: any) => t.status === "completed").length
        const pendingTasks = tasks.filter((t: any) => t.status === "pending").length

        const successRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0

        setStats({
          totalGoals,
          completedGoals,
          totalTasks,
          completedTasks,
          successRate,
          activeGoals,
          pendingTasks,
        })
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="font-serif">Loading...</CardTitle>
              <CardDescription>Please wait</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">-</div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Active Goals
          </CardTitle>
          <CardDescription>Currently working on</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{stats.activeGoals}</div>
          <p className="text-sm text-muted-foreground mt-1">
            {stats.completedGoals} completed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-secondary" />
            Tasks Completed
          </CardTitle>
          <CardDescription>This week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-secondary">{stats.completedTasks}</div>
          <p className="text-sm text-muted-foreground mt-1">
            {stats.pendingTasks} pending
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            Success Rate
          </CardTitle>
          <CardDescription>Overall</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-accent">{stats.successRate}%</div>
          <p className="text-sm text-muted-foreground mt-1">
            {stats.completedGoals} of {stats.totalGoals} goals
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
