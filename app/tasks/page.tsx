import { DashboardLayout } from "@/components/dashboard-layout"
import { TaskManagement } from "@/components/task-management/task-management"
import { AuthCheck } from "@/components/auth-check"

export default function TasksPage() {
  return (
    <AuthCheck>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="font-serif text-3xl font-bold">Task Management</h1>
            <p className="text-muted-foreground">Organize and track your AI-generated action items</p>
          </div>
          <TaskManagement />
        </div>
      </DashboardLayout>
    </AuthCheck>
  )
}
