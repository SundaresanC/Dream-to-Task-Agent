"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Clock, Settings } from "lucide-react"

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  category: string
  status: "connected" | "disconnected" | "error"
  features: string[]
  setupRequired: boolean
  lastSync?: Date
}

interface IntegrationCardProps {
  integration: Integration
  onConnect: (id: string) => void
  onDisconnect: (id: string) => void
  onRetry: (id: string) => void
}

export function IntegrationCard({ integration, onConnect, onDisconnect, onRetry }: IntegrationCardProps) {
  const Icon = integration.icon

  const getStatusBadge = () => {
    switch (integration.status) {
      case "connected":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        )
      case "error":
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        )
      case "disconnected":
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            Not Connected
          </Badge>
        )
    }
  }

  const getActionButton = () => {
    switch (integration.status) {
      case "connected":
        return (
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDisconnect(integration.id)}>
              Disconnect
            </Button>
          </div>
        )
      case "error":
        return (
          <Button variant="outline" size="sm" onClick={() => onRetry(integration.id)}>
            Retry Connection
          </Button>
        )
      case "disconnected":
        return (
          <Button onClick={() => onConnect(integration.id)} className="w-full">
            Connect
          </Button>
        )
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg font-serif">{integration.name}</CardTitle>
              <Badge variant="secondary" className="text-xs capitalize mt-1">
                {integration.category}
              </Badge>
            </div>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription className="text-sm">{integration.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Features</h4>
          <div className="flex flex-wrap gap-1">
            {integration.features.slice(0, 3).map((feature) => (
              <Badge key={feature} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
            {integration.features.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{integration.features.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {integration.lastSync && (
          <div className="text-xs text-muted-foreground">
            Last synced: {integration.lastSync.toLocaleDateString()} at {integration.lastSync.toLocaleTimeString()}
          </div>
        )}

        <div className="pt-2">{getActionButton()}</div>
      </CardContent>
    </Card>
  )
}
