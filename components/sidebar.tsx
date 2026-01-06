"use client"

import { LayoutDashboard, FolderOpen, MessageSquare, GitBranch, Eye, Download, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  currentView: string
  onNavigate: (view: string) => void
}

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "categories", label: "Categories", icon: FolderOpen },
    { id: "questions", label: "Questions", icon: MessageSquare },
    { id: "follow-ups", label: "Follow-ups", icon: GitBranch },
    { id: "preview", label: "Preview", icon: Eye },
    { id: "export", label: "Export/Import", icon: Download },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground tracking-tight">Flow Builder</h1>
        <p className="text-xs text-muted-foreground mt-1">Telegram Bot Flows</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id

          return (
            <Button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start gap-3 ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/20"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-sidebar-foreground"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Logout</span>
        </Button>
      </div>
    </aside>
  )
}
