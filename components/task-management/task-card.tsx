"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, Calendar, Tag, MoreHorizontal, Play, Square } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Task {
  id: string
  goalId: string
  title: string
  description: string
  status: "pending" | "in-progress" | "completed"
  priority: "high" | "medium" | "low"
  category: string
  estimatedHours: number
  dependencies: string[]
  dueDate: Date
  completedAt?: Date
  tags: string[]
}

interface TaskCardProps {
  task: Task
  compact?: boolean
}

export function TaskCard({ task, compact = false }: TaskCardProps) {
  const getStatusIcon = () => {
    switch (task.status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "in-progress":
        return <Play className="h-4 w-4 text-blue-600" />
      case "pending":
        return <Square className="h-4 w-4 text-gray-400" />
    }
  }

  const getPriorityColor = () => {
    switch (task.priority) {
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
    }
  }

  const getStatusColor = () => {
    switch (task.status) {
      case "completed":
        return "bg-green-50 border-green-200 text-green-800"
      case "in-progress":
        return "bg-blue-50 border-blue-200 text-blue-800"
      case "pending":
        return "bg-gray-50 border-gray-200 text-gray-600"
    }
  }

  const isOverdue = task.status !== "completed" && new Date() > task.dueDate
  const daysUntilDue = Math.ceil((task.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  // Mock progress for in-progress tasks
  const progress = task.status === "completed" ? 100 : task.status === "in-progress" ? 65 : 0

  return (
    <Card className={`transition-all hover:shadow-md ${getStatusColor()}`}>
      <CardContent className={`${compact ? "p-4" : "p-6"} space-y-3`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1">
            {getStatusIcon()}
            <div className="flex-1 space-y-1">
              <h4 className={`font-medium leading-tight ${compact ? "text-sm" : "text-base"}`}>{task.title}</h4>
              {!compact && <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={getPriorityColor()} className="text-xs">
              {task.priority}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit Task</DropdownMenuItem>
                <DropdownMenuItem>Change Status</DropdownMenuItem>
                <DropdownMenuItem>Set Reminder</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {task.status === "in-progress" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              {task.estimatedHours}h
            </div>
            <div className={`flex items-center gap-1 ${isOverdue ? "text-red-600" : "text-muted-foreground"}`}>
              <Calendar className="h-3 w-3" />
              {isOverdue ? "Overdue" : daysUntilDue === 0 ? "Due today" : `${daysUntilDue}d left`}
            </div>
          </div>

          <Badge variant="outline" className="text-xs capitalize">
            {task.category}
          </Badge>
        </div>

        {!compact && task.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="h-3 w-3 text-muted-foreground" />
            {task.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {task.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">+{task.tags.length - 3} more</span>
            )}
          </div>
        )}

        {task.dependencies.length > 0 && !compact && (
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Depends on:</span> {task.dependencies.join(", ")}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
