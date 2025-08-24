"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sparkles, Calendar, Target, CheckCircle, AlertCircle, Brain, Clock, TrendingUp } from "lucide-react"
import { PortiaClient, type PortiaProcessResult, type PortiaTask } from "@/lib/portia-integration"

interface ProcessedGoal extends PortiaProcessResult {}

export function GoalCapture() {
  const [goal, setGoal] = useState("")
  const [timeframe, setTimeframe] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedGoal, setProcessedGoal] = useState<ProcessedGoal | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [portiaClient] = useState(() => new PortiaClient())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!goal.trim() || !timeframe) return

    setIsProcessing(true)
    setError(null)

    try {
      const result = await portiaClient.processGoal(goal, timeframe, {
        userId: "current-user", // This would come from auth context
        preferences: {
          workingHoursPerWeek: 20,
          preferredWorkingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        },
      })

      if (!result.success) {
        throw new Error(result.error || "Failed to process goal with Portia AI")
      }

      setProcessedGoal(result)

      // Reset form
      setGoal("")
      setTimeframe("")
    } catch (err) {
      setError("Failed to process your goal with Portia AI. Please try again.")
      console.error("Portia goal processing error:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCreateTasks = async () => {
    if (!processedGoal) return

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goal,
          timeframe,
          portiaAnalysis: processedGoal.analysis,
          portiaTasks: processedGoal.tasks,
          portiaTimeline: processedGoal.timeline,
          planId: processedGoal.plan_id,
          runId: processedGoal.run_id,
          successTips: processedGoal.success_tips,
          potentialObstacles: processedGoal.potential_obstacles,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save tasks")
      }

      alert("Tasks created successfully with Portia AI analysis! Check your dashboard to see them.")
      setProcessedGoal(null)
    } catch (err) {
      setError("Failed to create tasks. Please try again.")
    }
  }

  if (processedGoal) {
    return (
      <Card className="h-fit">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-green-600" />
            <CardTitle className="font-serif">Portia AI Analysis Complete</CardTitle>
          </div>
          <CardDescription>
            Advanced agentic AI has analyzed your goal and created a comprehensive action plan
          </CardDescription>
          {processedGoal.plan_id && (
            <div className="flex gap-2 text-xs text-muted-foreground">
              <Badge variant="outline">Plan ID: {processedGoal.plan_id}</Badge>
              {processedGoal.run_id && <Badge variant="outline">Run ID: {processedGoal.run_id}</Badge>}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                AI Analysis
              </h4>
              <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-2">
                <div className="flex items-center gap-4 text-xs">
                  <Badge
                    variant={
                      processedGoal.analysis.complexity_level === "advanced"
                        ? "destructive"
                        : processedGoal.analysis.complexity_level === "intermediate"
                          ? "default"
                          : "secondary"
                    }
                  >
                    {processedGoal.analysis.complexity_level} complexity
                  </Badge>
                  <span className="text-muted-foreground">
                    Feasibility: {Math.round(processedGoal.analysis.feasibility_score * 100)}%
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Key Challenges:</p>
                  <p className="text-sm text-muted-foreground">{processedGoal.analysis.key_challenges.join(", ")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Required Resources:</p>
                  <p className="text-sm text-muted-foreground">
                    {processedGoal.analysis.required_resources.join(", ")}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-2">Generated Tasks ({processedGoal.tasks.length})</h4>
              <div className="space-y-2">
                {processedGoal.tasks.map((task: PortiaTask, index: number) => (
                  <div key={index} className="p-3 rounded-lg border border-border bg-muted/30">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h5 className="font-medium text-sm">{task.title}</h5>
                      <Badge variant="outline" className="text-xs">
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {task.estimated_hours}h estimated
                      </span>
                      <span className="capitalize">{task.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-2">Execution Timeline</h4>
              <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-2">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{processedGoal.timeline.total_duration_days} days total</span>
                  <span>{processedGoal.timeline.total_estimated_hours}h effort</span>
                  <span>{processedGoal.timeline.hours_per_week}h/week</span>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Milestones:</p>
                  <div className="space-y-1">
                    {processedGoal.timeline.milestones.slice(0, 3).map((milestone, index) => (
                      <div key={index} className="text-xs text-muted-foreground">
                        • {milestone.title} - {new Date(milestone.date).toLocaleDateString()}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-2">Success Tips</h4>
              <ul className="space-y-1">
                {processedGoal.success_tips.map((tip, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {processedGoal.potential_obstacles && processedGoal.potential_obstacles.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Potential Obstacles & Solutions</h4>
                <div className="space-y-2">
                  {processedGoal.potential_obstacles.map((item, index) => (
                    <div
                      key={index}
                      className="p-2 rounded border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950"
                    >
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-200">{item.obstacle}</p>
                      <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">Solution: {item.mitigation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCreateTasks} className="flex-1">
              <CheckCircle className="h-4 w-4 mr-2" />
              Create Tasks
            </Button>
            <Button variant="outline" onClick={() => setProcessedGoal(null)}>
              Start Over
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-fit">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <CardTitle className="font-serif">Capture Your Dream</CardTitle>
        </div>
        <CardDescription>
          Describe your goal or dream, and Portia AI will use advanced agentic workflows to break it down into
          actionable tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goal">What do you want to achieve?</Label>
            <Textarea
              id="goal"
              placeholder="e.g., I want to start a successful YouTube channel about cooking, learn to play guitar, or launch my own business..."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="min-h-[100px] resize-none"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeframe">Timeframe</Label>
            <Select value={timeframe} onValueChange={setTimeframe} required>
              <SelectTrigger>
                <SelectValue placeholder="Select your target timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-month">1 Month</SelectItem>
                <SelectItem value="3-months">3 Months</SelectItem>
                <SelectItem value="6-months">6 Months</SelectItem>
                <SelectItem value="1-year">1 Year</SelectItem>
                <SelectItem value="2-years">2+ Years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              Smart Scheduling
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Brain className="h-3 w-3 mr-1" />
              Portia AI Agents
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Agentic Workflows
            </Badge>
          </div>

          <Button type="submit" className="w-full" disabled={isProcessing || !goal.trim() || !timeframe}>
            {isProcessing ? (
              <>
                <Brain className="h-4 w-4 mr-2 animate-pulse" />
                Portia AI agents are analyzing your dream...
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                Transform with Portia AI
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
