"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IntegrationCard } from "./integration-card"
import { IntegrationSettings } from "./integration-settings"
import { Youtube, Calendar, FileText, Github, Slack, Trello, CheckCircle, AlertCircle, Settings } from "lucide-react"

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  category: "productivity" | "content" | "development" | "communication"
  status: "connected" | "disconnected" | "error"
  features: string[]
  setupRequired: boolean
  lastSync?: Date
}

const availableIntegrations: Integration[] = [
  {
    id: "youtube",
    name: "YouTube",
    description: "Automate video uploads, manage playlists, and track channel analytics",
    icon: Youtube,
    category: "content",
    status: "connected",
    features: ["Video Upload", "Playlist Management", "Analytics Tracking", "Comment Monitoring"],
    setupRequired: false,
    lastSync: new Date("2024-01-15T10:30:00"),
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Schedule tasks, set reminders, and manage your time effectively",
    icon: Calendar,
    category: "productivity",
    status: "connected",
    features: ["Task Scheduling", "Reminder Creation", "Calendar Sync", "Meeting Integration"],
    setupRequired: false,
    lastSync: new Date("2024-01-15T09:15:00"),
  },
  {
    id: "notion",
    name: "Notion",
    description: "Create databases, manage projects, and organize your knowledge",
    icon: FileText,
    category: "productivity",
    status: "disconnected",
    features: ["Database Creation", "Page Templates", "Task Tracking", "Knowledge Base"],
    setupRequired: true,
  },
  {
    id: "github",
    name: "GitHub",
    description: "Manage repositories, track issues, and automate development workflows",
    icon: Github,
    category: "development",
    status: "disconnected",
    features: ["Repository Management", "Issue Tracking", "PR Automation", "Code Analysis"],
    setupRequired: true,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Send notifications, create channels, and manage team communication",
    icon: Slack,
    category: "communication",
    status: "error",
    features: ["Message Automation", "Channel Management", "Notification System", "Team Updates"],
    setupRequired: true,
  },
  {
    id: "trello",
    name: "Trello",
    description: "Create boards, manage cards, and organize project workflows",
    icon: Trello,
    category: "productivity",
    status: "disconnected",
    features: ["Board Creation", "Card Management", "Workflow Automation", "Team Collaboration"],
    setupRequired: true,
  },
]

export function IntegrationManager() {
  const [integrations, setIntegrations] = useState(availableIntegrations)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIntegrations()
  }, [])

  const fetchIntegrations = async () => {
    try {
      const response = await fetch("/api/integrations")
      if (response.ok) {
        const data = await response.json()
        // Merge database integrations with available integrations
        const dbIntegrations = data.data || []
        const mergedIntegrations = availableIntegrations.map(integration => {
          const dbIntegration = dbIntegrations.find((db: any) => db.platformId === integration.id)
          return dbIntegration ? {
            ...integration,
            status: dbIntegration.status,
            lastSync: dbIntegration.lastSync ? new Date(dbIntegration.lastSync) : undefined,
          } : integration
        })
        setIntegrations(mergedIntegrations)
      }
    } catch (error) {
      console.error("Failed to fetch integrations:", error)
    } finally {
      setLoading(false)
    }
  }

  const connectedIntegrations = integrations.filter((i) => i.status === "connected")
  const errorIntegrations = integrations.filter((i) => i.status === "error")

  const filteredIntegrations =
    selectedCategory === "all" ? integrations : integrations.filter((i) => i.category === selectedCategory)

  const handleConnect = async (integrationId: string) => {
    try {
      const response = await fetch("/api/integrations/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platformId: integrationId }),
      })
      
      if (response.ok) {
        await fetchIntegrations()
      }
    } catch (error) {
      console.error("Failed to connect integration:", error)
    }
  }

  const handleDisconnect = async (integrationId: string) => {
    try {
      const response = await fetch(`/api/integrations/${integrationId}`, {
        method: "DELETE",
      })
      
      if (response.ok) {
        await fetchIntegrations()
      }
    } catch (error) {
      console.error("Failed to disconnect integration:", error)
    }
  }

  const handleRetry = async (integrationId: string) => {
    try {
      const response = await fetch("/api/integrations/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platformId: integrationId }),
      })
      
      if (response.ok) {
        await fetchIntegrations()
      }
    } catch (error) {
      console.error("Failed to retry integration:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Integration Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{connectedIntegrations.length}</div>
            <p className="text-xs text-muted-foreground">Active integrations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integrations.length}</div>
            <p className="text-xs text-muted-foreground">Total platforms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{errorIntegrations.length}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Integration Management */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Platforms</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="development">Development</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {integrations.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                onRetry={handleRetry}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="productivity" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {integrations
              .filter((i) => i.category === "productivity")
              .map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                  onRetry={handleRetry}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {integrations
              .filter((i) => i.category === "content")
              .map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                  onRetry={handleRetry}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="development" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {integrations
              .filter((i) => i.category === "development")
              .map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                  onRetry={handleRetry}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="communication" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {integrations
              .filter((i) => i.category === "communication")
              .map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                  onRetry={handleRetry}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Integration Settings */}
      <IntegrationSettings integrations={connectedIntegrations} />
    </div>
  )
}
