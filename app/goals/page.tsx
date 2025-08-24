import { DashboardLayout } from "@/components/dashboard-layout"
import { GoalsManagement } from "@/components/goals/goals-management"
import { AuthCheck } from "@/components/auth-check"

export default function GoalsPage() {
  return (
    <AuthCheck>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="font-serif text-3xl font-bold">Goals Management</h1>
            <p className="text-muted-foreground">Track, manage, and achieve your dreams with AI-powered insights</p>
          </div>
          <GoalsManagement />
        </div>
      </DashboardLayout>
    </AuthCheck>
  )
}
