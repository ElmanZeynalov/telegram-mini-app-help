"use client"

import React, { createContext, useContext, useEffect, useRef, useState } from "react"
import { useTelegram } from "@/features/telegram/hooks/use-telegram"
import { useLocaleStore } from "@/features/i18n/stores/locale-store"

interface AnalyticsContextType {
    track: (eventType: string, metadata?: any) => void
    sessionId: string | null
}

const AnalyticsContext = createContext<AnalyticsContextType>({
    track: () => { },
    sessionId: null,
})

export const useAnalytics = () => useContext(AnalyticsContext)

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
    const { webApp, isInitialized: isTelegramInitialized } = useTelegram()
    const user = webApp?.initDataUnsafe?.user
    const [sessionId, setSessionId] = useState<string | null>(null)
    const isTrackingInitialized = useRef(false)
    const locale = useLocaleStore((state) => state.locale)

    // Initialize Session
    useEffect(() => {
        // Wait for Telegram SDK to initialize before starting session
        if (!isTelegramInitialized) return

        // Prevent double tracking
        if (isTrackingInitialized.current) return
        isTrackingInitialized.current = true

        const initSession = async () => {
            try {
                // DO NOT check local storage for existing session.
                // We want a FRESH session on every app load (as requested: Open -> Start, Close -> End).

                // Track 'session_start' which handles creation
                const res = await fetch("/api/analytics/track", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        eventType: "session_start",
                        telegramId: user?.id ? String(user.id) : undefined,
                        // existingSessionId: undefined, // Always force new
                        firstName: user?.first_name,
                        lastName: user?.last_name,
                        username: user?.username,
                        metadata: { language: locale } // Inject language
                    }),
                })

                if (res.ok) {
                    const data = await res.json()
                    if (data.sessionId) {
                        setSessionId(data.sessionId)
                        // Do NOT save to localStorage
                    }
                }
            } catch (e) {
                console.error("Failed to init analytics session", e)
            }
        }

        initSession()

        // Handle Session End on Unload / Hide
        const handleSessionEnd = () => {
            if (!sessionId) return

            // Use fetch with keepalive: true instead of sendBeacon for better JSON support
            fetch('/api/analytics/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventType: 'session_end',
                    existingSessionId: sessionId,
                    telegramId: user?.id ? String(user.id) : undefined
                }),
                keepalive: true
            }).catch(console.error);
        }

        const onVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                handleSessionEnd()
            }
        }

        // We use visibilitychange because mostly on mobile/Telegram closing the mini app might not trigger pagehide/unload reliably
        // but 'hidden' is a good proxy for "User left the app".
        // Note: This might trigger if they just switch tabs, but strict "Close App" in Telegram usually kills the webview.
        document.addEventListener('visibilitychange', onVisibilityChange)

        return () => {
            document.removeEventListener('visibilitychange', onVisibilityChange)
        }
    }, [isTelegramInitialized, user, sessionId])

    const track = async (eventType: string, metadata?: any) => {
        try {
            if (!sessionId) {
                // If session not ready, maybe queue? For MVP, skip or try best effort with local storage
            }

            // Use current state sessionId only (Ephemeral session)
            const currentSessionId = sessionId; // || localStorage.getItem("analytics_session_id")

            // Use Telegram ID if checking TWA, otherwise use Guest ID
            const activeId = user?.id ? String(user.id) : (localStorage.getItem("guest_analytics_id") || (() => {
                const newId = `guest_${Math.random().toString(36).slice(2, 11)}`
                localStorage.setItem("guest_analytics_id", newId)
                return newId
            })())

            const res = await fetch("/api/analytics/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    eventType,
                    sessionId: currentSessionId,
                    existingSessionId: currentSessionId,
                    telegramId: activeId,
                    metadata: {
                        ...metadata,
                        language: locale
                    },
                    region: metadata?.region || undefined
                }),
            })
            if (!res.ok) {
                console.error("Analytics API Failed:", res.status, await res.text())
            }
        } catch (e) {
            console.error("Track error:", e)
        }
    }

    return (
        <AnalyticsContext.Provider value={{ track, sessionId }}>
            {children}
        </AnalyticsContext.Provider>
    )
}
