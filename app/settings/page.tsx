import { DashboardLayout } from "@/components/dashboard-layout"
import { SettingsManagement } from "@/components/settings/settings-management"
import { AuthCheck } from "@/components/auth-check"

export default function SettingsPage() {
  return (
    <AuthCheck>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="font-serif text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Customize your Dream-to-Task Agent experience</p>
          </div>
          <SettingsManagement />
        </div>
      </DashboardLayout>
    </AuthCheck>
  )
}
