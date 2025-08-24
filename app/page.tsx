"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthForm } from "@/components/auth-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Auto-login demo user for seamless experience
    const autoLogin = async () => {
      try {
        console.log("Attempting auto-login...")
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "demo@example.com",
            password: "demo123"
          }),
        })

        console.log("Login response status:", response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log("Login successful:", data)
          router.push("/dashboard")
        } else {
          const errorData = await response.json()
          console.log("Login failed:", errorData)
        }
      } catch (error) {
        console.log("Auto-login failed:", error)
      }
    }

    autoLogin()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <h1 className="font-serif text-4xl font-bold text-foreground">Dream-to-Task Agent</h1>
          <p className="text-muted-foreground text-lg">
            Transform your dreams into actionable tasks with AI-powered workflows
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-2">
            <CardTitle className="font-serif text-2xl text-center">Welcome</CardTitle>
            <CardDescription className="text-center">Sign in to start turning your dreams into reality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AuthForm />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Demo account will be automatically logged in
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
