"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Settings, Send as Sync, Shield } from "lucide-react"

interface Integration {
  id: string
  name: string
  icon: React.ComponentType<any>
  status: string
  lastSync?: Date
}

interface IntegrationSettingsProps {
  integrations: Integration[]
}

export function IntegrationSettings({ integrations }: IntegrationSettingsProps) {
  if (integrations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Integration Settings
          </CardTitle>
          <CardDescription>Configure your connected platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Connect some platforms to access integration settings
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Integration Settings
        </CardTitle>
        <CardDescription>Configure your connected platforms and automation preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Global Settings */}
        <div className="space-y-4">
          <h3 className="font-medium">Global Settings</h3>

          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-sync enabled</Label>
                <p className="text-sm text-muted-foreground">Automatically sync data with connected platforms</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Smart notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get intelligent alerts about task progress and deadlines
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Cross-platform task creation</Label>
                <p className="text-sm text-muted-foreground">Automatically create tasks in connected platforms</p>
              </div>
              <Switch />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Sync frequency</Label>
              <Select defaultValue="15min">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5min">Every 5 minutes</SelectItem>
                  <SelectItem value="15min">Every 15 minutes</SelectItem>
                  <SelectItem value="30min">Every 30 minutes</SelectItem>
                  <SelectItem value="1hour">Every hour</SelectItem>
                  <SelectItem value="manual">Manual only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Default timezone</Label>
              <Select defaultValue="utc">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utc">UTC</SelectItem>
                  <SelectItem value="est">Eastern Time</SelectItem>
                  <SelectItem value="pst">Pacific Time</SelectItem>
                  <SelectItem value="cet">Central European Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Connected Platforms */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Connected Platforms</h3>
            <Button variant="outline" size="sm">
              <Sync className="h-4 w-4 mr-2" />
              Sync All
            </Button>
          </div>

          <div className="space-y-3">
            {integrations.map((integration) => {
              const Icon = integration.icon
              return (
                <div key={integration.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <div>
                      <p className="font-medium">{integration.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Last sync: {integration.lastSync?.toLocaleString() || "Never"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Active
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Security Settings */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security & Privacy
          </h3>

          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Data encryption</Label>
                <p className="text-sm text-muted-foreground">Encrypt all data transmitted between platforms</p>
              </div>
              <Switch defaultChecked disabled />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Usage analytics</Label>
                <p className="text-sm text-muted-foreground">
                  Help improve the service by sharing anonymous usage data
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline">Export Settings</Button>
          <Button variant="outline">Reset to Defaults</Button>
        </div>
      </CardContent>
    </Card>
  )
}
