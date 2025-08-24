import { DashboardLayout } from "@/components/dashboard-layout"
import { IntegrationManager } from "@/components/integrations/integration-manager"
import { AuthCheck } from "@/components/auth-check"

export default function IntegrationsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-bold">Platform Integrations</h1>
          <p className="text-muted-foreground">
            Connect your favorite platforms to automate task execution and progress tracking
          </p>
        </div>
        <IntegrationManager />
      </div>
    </DashboardLayout>
  )
}
