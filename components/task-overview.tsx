"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckSquare, Clock, Calendar, ArrowRight } from "lucide-react"

interface Task {
  _id: string
  title: string
  description: string
  status: "pending" | "in-progress" | "completed"
  dueDate?: string
  progress: number
}

export function TaskOverview() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks")
      if (response.ok) {
        const data = await response.json()
        const recentTasks = (data.data || []).slice(0, 5) // Show only 5 most recent tasks
        setTasks(recentTasks)
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const completedTasks = tasks.filter((task) => task.status === "completed").length
  const totalTasks = tasks.length
  const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <Card className="h-fit">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            <CardTitle className="font-serif">Active Tasks</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={() => window.location.href = "/tasks"}>
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        <CardDescription>Your current action items from recent goals</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No tasks yet. Create your first goal to get started!</div>
          ) : (
            tasks.map((task) => (
              <div key={task._id} className="p-3 rounded-lg border border-border bg-muted/30 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-1">
                    <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
                    <p className="text-xs text-muted-foreground">{task.description}</p>
                  </div>
                  <Badge
                    variant={
                      task.status === "completed" ? "default" : task.status === "in-progress" ? "secondary" : "outline"
                    }
                    className="text-xs shrink-0"
                  >
                    {task.status === "completed" ? "Done" : task.status === "in-progress" ? "Active" : "Pending"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {task.dueDate ? `Due ${new Date(task.dueDate).toLocaleDateString()}` : "No due date"}
                  </div>
                  {task.status === "in-progress" && (
                    <div className="flex items-center gap-2">
                      <Progress value={task.progress} className="h-1 w-16" />
                      <span className="text-muted-foreground">{task.progress}%</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <Button variant="outline" className="w-full bg-transparent">
          <Clock className="h-4 w-4 mr-2" />
          Schedule Next Session
        </Button>
      </CardContent>
    </Card>
  )
}
