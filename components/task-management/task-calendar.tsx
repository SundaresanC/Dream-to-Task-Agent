"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock } from "lucide-react"

interface Task {
  id: string
  title: string
  status: "pending" | "in-progress" | "completed"
  priority: "high" | "medium" | "low"
  dueDate: Date
  estimatedHours: number
}

interface TaskCalendarProps {
  tasks: Task[]
}

export function TaskCalendar({ tasks }: TaskCalendarProps) {
  // Group tasks by date
  const tasksByDate = tasks.reduce(
    (acc, task) => {
      const dateKey = task.dueDate.toISOString().split("T")[0]
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(task)
      return acc
    },
    {} as Record<string, Task[]>,
  )

  // Get next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return date
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-primary" />
        <h3 className="font-serif text-lg font-semibold">Upcoming Tasks</h3>
      </div>

      <div className="grid gap-4">
        {dates.map((date) => {
          const dateKey = date.toISOString().split("T")[0]
          const dayTasks = tasksByDate[dateKey] || []
          const isToday = date.toDateString() === new Date().toDateString()

          return (
            <Card key={dateKey} className={isToday ? "border-primary" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span className={isToday ? "text-primary" : ""}>
                    {date.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                    {isToday && " (Today)"}
                  </span>
                  {dayTasks.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {dayTasks.length} task{dayTasks.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>

              {dayTasks.length > 0 ? (
                <CardContent className="pt-0 space-y-2">
                  {dayTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">{task.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={
                              task.priority === "high"
                                ? "destructive"
                                : task.priority === "medium"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="text-xs"
                          >
                            {task.priority}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {task.estimatedHours}h
                          </div>
                        </div>
                      </div>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          task.status === "completed"
                            ? "bg-green-500"
                            : task.status === "in-progress"
                              ? "bg-blue-500"
                              : "bg-gray-400"
                        }`}
                      />
                    </div>
                  ))}
                </CardContent>
              ) : (
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">No tasks scheduled</p>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
