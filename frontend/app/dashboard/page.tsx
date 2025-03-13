"use client"

import Link from "next/link"
import { BarChart3, Users, MessageSquare, Settings, Film, FileText, Calendar } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Welcome, {user?.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card text-card-foreground p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Medical Records</h2>
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <p className="text-3xl font-bold">12</p>
          <p className="text-success text-sm mt-2">↑ 2 new this month</p>
        </div>

        <div className="bg-card text-card-foreground p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Appointments</h2>
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <p className="text-3xl font-bold">3</p>
          <p className="text-muted-foreground text-sm mt-2">Upcoming this week</p>
        </div>

        <div className="bg-card text-card-foreground p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Messages</h2>
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <p className="text-3xl font-bold">8</p>
          <p className="text-destructive text-sm mt-2">5 unread messages</p>
        </div>

        <div className="bg-card text-card-foreground p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Video Consultations</h2>
            <Film className="h-6 w-6 text-primary" />
          </div>
          <p className="text-3xl font-bold">1</p>
          <p className="text-muted-foreground text-sm mt-2">Scheduled for tomorrow</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card text-card-foreground p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/dashboard/medical-records"
              className="flex items-center p-4 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <FileText className="h-6 w-6 text-primary mr-3" />
              <div>
                <h3 className="font-medium">Medical Records</h3>
                <p className="text-sm text-muted-foreground">View and manage your medical records</p>
              </div>
            </Link>

            <Link
              href="/dashboard/appointments"
              className="flex items-center p-4 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Calendar className="h-6 w-6 text-primary mr-3" />
              <div>
                <h3 className="font-medium">Appointments</h3>
                <p className="text-sm text-muted-foreground">Schedule and manage appointments</p>
              </div>
            </Link>

            <Link
              href="/dashboard/messages"
              className="flex items-center p-4 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <MessageSquare className="h-6 w-6 text-primary mr-3" />
              <div>
                <h3 className="font-medium">Messages</h3>
                <p className="text-sm text-muted-foreground">Check your recent messages</p>
              </div>
            </Link>

            <Link
              href="/dashboard/videos"
              className="flex items-center p-4 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Film className="h-6 w-6 text-primary mr-3" />
              <div>
                <h3 className="font-medium">Video Consultations</h3>
                <p className="text-sm text-muted-foreground">Join or schedule video consultations</p>
              </div>
            </Link>

            <Link
              href="/dashboard/profile"
              className="flex items-center p-4 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Users className="h-6 w-6 text-primary mr-3" />
              <div>
                <h3 className="font-medium">Profile</h3>
                <p className="text-sm text-muted-foreground">Manage your account details</p>
              </div>
            </Link>

            <Link
              href="/dashboard/settings"
              className="flex items-center p-4 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Settings className="h-6 w-6 text-primary mr-3" />
              <div>
                <h3 className="font-medium">Settings</h3>
                <p className="text-sm text-muted-foreground">Configure your preferences</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-card text-card-foreground p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { action: "Uploaded medical record", time: "2 hours ago" },
              { action: "Scheduled appointment", time: "Yesterday" },
              { action: "Received new message", time: "2 days ago" },
              { action: "Completed video consultation", time: "1 week ago" },
              { action: "Updated profile information", time: "2 weeks ago" },
            ].map((activity, index) => (
              <div key={index} className="flex justify-between pb-2 border-b">
                <span>{activity.action}</span>
                <span className="text-sm text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

