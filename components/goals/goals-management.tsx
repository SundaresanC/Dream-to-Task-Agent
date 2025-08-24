"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Target, TrendingUp, Plus, Edit, Trash2, CheckCircle } from "lucide-react"

interface Goal {
  _id: string
  title: string
  description: string
  category: string
  priority: "low" | "medium" | "high"
  status: "active" | "completed" | "paused"
  progress: number
  targetDate: string
  createdAt: string
  tasks: Array<{
    id: string
    title: string
    completed: boolean
  }>
}

export function GoalsManagement() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium" as const,
    targetDate: "",
  })

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      const response = await fetch("/api/goals")
      if (response.ok) {
        const data = await response.json()
        setGoals(data || [])
      }
    } catch (error) {
      console.error("Failed to fetch goals:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingGoal ? `/api/goals/${editingGoal._id}` : "/api/goals"
      const method = editingGoal ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchGoals()
        setShowAddForm(false)
        setEditingGoal(null)
        setFormData({ title: "", description: "", category: "", priority: "medium", targetDate: "" })
      }
    } catch (error) {
      console.error("Failed to save goal:", error)
    }
  }

  const deleteGoal = async (goalId: string) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, { method: "DELETE" })
      if (response.ok) {
        await fetchGoals()
      }
    } catch (error) {
      console.error("Failed to delete goal:", error)
    }
  }

  const updateGoalStatus = async (goalId: string, status: string) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (response.ok) {
        await fetchGoals()
      }
    } catch (error) {
      console.error("Failed to update goal status:", error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "active":
        return "bg-blue-100 text-blue-800"
      case "paused":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return <div className="flex justify-center py-8">Loading goals...</div>
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Goals</p>
                <p className="text-2xl font-bold">{goals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{goals.filter((g) => g.status === "completed").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{goals.filter((g) => g.status === "active").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
                <p className="text-2xl font-bold">
                  {goals.length > 0 ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Goal Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Goals</h2>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Goal
        </Button>
      </div>

      {/* Add/Edit Goal Form */}
      {(showAddForm || editingGoal) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingGoal ? "Edit Goal" : "Add New Goal"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter goal title"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Career, Health, Personal"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your goal in detail"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Target Date</label>
                  <Input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingGoal ? "Update Goal" : "Create Goal"}</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingGoal(null)
                    setFormData({ title: "", description: "", category: "", priority: "medium", targetDate: "" })
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Goals List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Goals</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {goals.map((goal) => (
            <Card key={goal._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <CardTitle className="flex items-center gap-2">
                      {goal.title}
                      <Badge className={getPriorityColor(goal.priority)}>{goal.priority}</Badge>
                      <Badge className={getStatusColor(goal.status)}>{goal.status}</Badge>
                    </CardTitle>
                    <CardDescription>{goal.description}</CardDescription>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Category: {goal.category}</span>
                      {goal.targetDate && <span>Due: {new Date(goal.targetDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingGoal(goal)
                        setFormData({
                          title: goal.title,
                          description: goal.description,
                          category: goal.category,
                          priority: goal.priority,
                          targetDate: goal.targetDate,
                        })
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => deleteGoal(goal._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>

                  {goal.tasks && goal.tasks.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Related Tasks</h4>
                      <div className="space-y-1">
                        {goal.tasks.slice(0, 3).map((task) => (
                          <div key={task.id} className="flex items-center gap-2 text-sm">
                            <CheckCircle className={`h-4 w-4 ${task.completed ? "text-green-500" : "text-gray-300"}`} />
                            <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                              {task.title}
                            </span>
                          </div>
                        ))}
                        {goal.tasks.length > 3 && (
                          <p className="text-sm text-muted-foreground">+{goal.tasks.length - 3} more tasks</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {goal.status !== "completed" && (
                      <Button size="sm" onClick={() => updateGoalStatus(goal._id, "completed")}>
                        Mark Complete
                      </Button>
                    )}
                    {goal.status === "active" && (
                      <Button size="sm" variant="outline" onClick={() => updateGoalStatus(goal._id, "paused")}>
                        Pause
                      </Button>
                    )}
                    {goal.status === "paused" && (
                      <Button size="sm" variant="outline" onClick={() => updateGoalStatus(goal._id, "active")}>
                        Resume
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {goals
            .filter((g) => g.status === "active")
            .map((goal) => (
              <Card key={goal._id}>{/* Same card content as above */}</Card>
            ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {goals
            .filter((g) => g.status === "completed")
            .map((goal) => (
              <Card key={goal._id}>{/* Same card content as above */}</Card>
            ))}
        </TabsContent>

        <TabsContent value="paused" className="space-y-4">
          {goals
            .filter((g) => g.status === "paused")
            .map((goal) => (
              <Card key={goal._id}>{/* Same card content as above */}</Card>
            ))}
        </TabsContent>
      </Tabs>

      {goals.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No goals yet</h3>
            <p className="text-muted-foreground mb-4">Start by creating your first goal to begin your journey</p>
            <Button onClick={() => setShowAddForm(true)}>Create Your First Goal</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
