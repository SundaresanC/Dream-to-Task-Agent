"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { User, Bell, Palette, Shield, Database, Zap, Save, RefreshCw, Download, Upload } from "lucide-react"

interface UserPreferences {
  theme: "light" | "dark" | "system"
  language: string
  timezone: string
  notifications: {
    email: boolean
    push: boolean
    taskReminders: boolean
    goalDeadlines: boolean
    weeklyReports: boolean
  }
  privacy: {
    profileVisibility: "public" | "private"
    dataSharing: boolean
    analytics: boolean
  }
  ai: {
    autoGenerateTasks: boolean
    complexityLevel: "simple" | "detailed" | "comprehensive"
    preferredTimeframe: "short" | "medium" | "long"
  }
}

interface AppContent {
  appName: string
  tagline: string
  welcomeMessage: string
  primaryColor: string
  accentColor: string
}

export function SettingsManagement() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: "system",
    language: "en",
    timezone: "UTC",
    notifications: {
      email: true,
      push: true,
      taskReminders: true,
      goalDeadlines: true,
      weeklyReports: false,
    },
    privacy: {
      profileVisibility: "private",
      dataSharing: false,
      analytics: true,
    },
    ai: {
      autoGenerateTasks: true,
      complexityLevel: "detailed",
      preferredTimeframe: "medium",
    },
  })

  const [appContent, setAppContent] = useState<AppContent>({
    appName: "Dream-to-Task Agent",
    tagline: "Transform your dreams into actionable tasks",
    welcomeMessage: "Welcome to your personal AI-powered goal achievement system",
    primaryColor: "#0ea5e9",
    accentColor: "#ec4899",
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const [prefsResponse, contentResponse] = await Promise.all([fetch("/api/settings"), fetch("/api/content")])

      if (prefsResponse.ok) {
        const prefsData = await prefsResponse.json()
        if (prefsData.preferences) {
          setPreferences(prefsData.preferences)
        }
      }

      if (contentResponse.ok) {
        const contentData = await contentResponse.json()
        if (contentData.content) {
          setAppContent(contentData.content)
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const [prefsResponse, contentResponse] = await Promise.all([
        fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ preferences }),
        }),
        fetch("/api/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: appContent }),
        }),
      ])

      if (prefsResponse.ok && contentResponse.ok) {
        // Show success message
        console.log("Settings saved successfully")
      }
    } catch (error) {
      console.error("Failed to save settings:", error)
    } finally {
      setSaving(false)
    }
  }

  const exportSettings = () => {
    const data = { preferences, appContent }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "dream-task-agent-settings.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          if (data.preferences) setPreferences(data.preferences)
          if (data.appContent) setAppContent(data.appContent)
        } catch (error) {
          console.error("Failed to import settings:", error)
        }
      }
      reader.readAsText(file)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-8">Loading settings...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-muted-foreground">Manage your preferences and app configuration</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportSettings}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <label className="cursor-pointer">
            <Button variant="outline" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </span>
            </Button>
            <input type="file" accept=".json" onChange={importSettings} className="hidden" />
          </label>
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            AI Settings
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Content
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Manage your personal information and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Language</label>
                  <Select
                    value={preferences.language}
                    onValueChange={(value) => setPreferences((prev) => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Timezone</label>
                  <Select
                    value={preferences.timezone}
                    onValueChange={(value) => setPreferences((prev) => ({ ...prev, timezone: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>Customize the look and feel of your application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Theme</label>
                <Select
                  value={preferences.theme}
                  onValueChange={(value: any) => setPreferences((prev) => ({ ...prev, theme: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified about important events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  checked={preferences.notifications.email}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, email: checked },
                    }))
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Push Notifications</h4>
                  <p className="text-sm text-muted-foreground">Receive push notifications in your browser</p>
                </div>
                <Switch
                  checked={preferences.notifications.push}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, push: checked },
                    }))
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Task Reminders</h4>
                  <p className="text-sm text-muted-foreground">Get reminded about upcoming tasks</p>
                </div>
                <Switch
                  checked={preferences.notifications.taskReminders}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, taskReminders: checked },
                    }))
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Goal Deadlines</h4>
                  <p className="text-sm text-muted-foreground">Notifications for approaching goal deadlines</p>
                </div>
                <Switch
                  checked={preferences.notifications.goalDeadlines}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, goalDeadlines: checked },
                    }))
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Weekly Reports</h4>
                  <p className="text-sm text-muted-foreground">Receive weekly progress summaries</p>
                </div>
                <Switch
                  checked={preferences.notifications.weeklyReports}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, weeklyReports: checked },
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control your data and privacy preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium">Profile Visibility</label>
                <Select
                  value={preferences.privacy.profileVisibility}
                  onValueChange={(value: any) =>
                    setPreferences((prev) => ({
                      ...prev,
                      privacy: { ...prev.privacy, profileVisibility: value },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Data Sharing</h4>
                  <p className="text-sm text-muted-foreground">Allow sharing anonymized data for improvements</p>
                </div>
                <Switch
                  checked={preferences.privacy.dataSharing}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({
                      ...prev,
                      privacy: { ...prev.privacy, dataSharing: checked },
                    }))
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Analytics</h4>
                  <p className="text-sm text-muted-foreground">Help improve the app with usage analytics</p>
                </div>
                <Switch
                  checked={preferences.privacy.analytics}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({
                      ...prev,
                      privacy: { ...prev.privacy, analytics: checked },
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Assistant Settings</CardTitle>
              <CardDescription>Configure how the AI processes your goals and generates tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Auto-Generate Tasks</h4>
                  <p className="text-sm text-muted-foreground">Automatically create tasks from your goals</p>
                </div>
                <Switch
                  checked={preferences.ai.autoGenerateTasks}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({
                      ...prev,
                      ai: { ...prev.ai, autoGenerateTasks: checked },
                    }))
                  }
                />
              </div>
              <Separator />
              <div>
                <label className="text-sm font-medium">Task Complexity Level</label>
                <Select
                  value={preferences.ai.complexityLevel}
                  onValueChange={(value: any) =>
                    setPreferences((prev) => ({
                      ...prev,
                      ai: { ...prev.ai, complexityLevel: value },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Simple - Basic task breakdown</SelectItem>
                    <SelectItem value="detailed">Detailed - Comprehensive planning</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive - Advanced strategies</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Preferred Timeframe</label>
                <Select
                  value={preferences.ai.preferredTimeframe}
                  onValueChange={(value: any) =>
                    setPreferences((prev) => ({
                      ...prev,
                      ai: { ...prev.ai, preferredTimeframe: value },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short-term (1-3 months)</SelectItem>
                    <SelectItem value="medium">Medium-term (3-12 months)</SelectItem>
                    <SelectItem value="long">Long-term (1+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>App Content Management</CardTitle>
              <CardDescription>Customize the app's branding and messaging</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">App Name</label>
                <Input
                  value={appContent.appName}
                  onChange={(e) => setAppContent((prev) => ({ ...prev, appName: e.target.value }))}
                  placeholder="Enter app name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tagline</label>
                <Input
                  value={appContent.tagline}
                  onChange={(e) => setAppContent((prev) => ({ ...prev, tagline: e.target.value }))}
                  placeholder="Enter tagline"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Welcome Message</label>
                <Textarea
                  value={appContent.welcomeMessage}
                  onChange={(e) => setAppContent((prev) => ({ ...prev, welcomeMessage: e.target.value }))}
                  placeholder="Enter welcome message"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Primary Color</label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={appContent.primaryColor}
                      onChange={(e) => setAppContent((prev) => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-16 h-10"
                    />
                    <Input
                      value={appContent.primaryColor}
                      onChange={(e) => setAppContent((prev) => ({ ...prev, primaryColor: e.target.value }))}
                      placeholder="#0ea5e9"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Accent Color</label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={appContent.accentColor}
                      onChange={(e) => setAppContent((prev) => ({ ...prev, accentColor: e.target.value }))}
                      className="w-16 h-10"
                    />
                    <Input
                      value={appContent.accentColor}
                      onChange={(e) => setAppContent((prev) => ({ ...prev, accentColor: e.target.value }))}
                      placeholder="#ec4899"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
