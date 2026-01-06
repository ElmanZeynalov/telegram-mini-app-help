"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useLegalGuidance } from "../../hooks/use-legal-guidance"
import { useTelegram } from "@/src/features/telegram"

interface NavigableContentLayoutProps {
  children: React.ReactNode
  footer?: React.ReactNode
}

/**
 * Layout for screens that have back navigation
 * Used by categories, questions, and answer screens
 * 
 * Note: In Telegram, the native back button is used instead of our own
 */
export function NavigableContentLayout({ children, footer }: NavigableContentLayoutProps) {
  const { goBack } = useLegalGuidance()
  const { isTelegram } = useTelegram()

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header - only show when NOT in Telegram (Telegram has its own back button) */}
      {!isTelegram ? (
        <header className="flex-shrink-0 flex items-center px-3 py-3 bg-background/80 backdrop-blur-sm border-b border-border/30 sticky top-0 z-10">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={goBack} 
            className="h-10 w-10 rounded-xl hover:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </header>
      ) : (
        /* Spacer for Telegram's header - pushes content below native UI
           Uses env(safe-area-inset-top) for device notch/status bar (cross-device)
           Plus 44px for Telegram's header bar */
        <div 
          className="flex-shrink-0"
          style={{ 
            height: 'calc(env(safe-area-inset-top, 20px) + 44px)' 
          }} 
        />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">{children}</main>

      {/* Optional footer */}
      {footer && (
        <footer className="flex-shrink-0 p-4 bg-background/80 backdrop-blur-sm border-t border-border/30">
          {footer}
        </footer>
      )}
    </div>
  )
}
