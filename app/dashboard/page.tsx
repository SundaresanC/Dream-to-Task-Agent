import { DashboardLayout } from "@/components/dashboard-layout"
import { GoalCapture } from "@/components/goal-capture"
import { TaskOverview } from "@/components/task-overview"
import { DashboardStats } from "@/components/dashboard-stats"
import { AuthCheck } from "@/components/auth-check"

export default function DashboardPage() {
  return (
    <AuthCheck>
      <DashboardLayout>
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="font-serif text-3xl font-bold">Welcome back!</h1>
            <p className="text-muted-foreground">Ready to turn your dreams into actionable tasks?</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <GoalCapture />
            <TaskOverview />
          </div>

          <DashboardStats />
        </div>
      </DashboardLayout>
    </AuthCheck>
  )
}
