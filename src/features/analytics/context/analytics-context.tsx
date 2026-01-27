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
                // Check local storage for existing session
                const storedSessionId = localStorage.getItem("analytics_session_id")

                // Track 'session_start' which handles creation or linking
                const res = await fetch("/api/analytics/track", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        eventType: "session_start",
                        telegramId: user?.id ? String(user.id) : undefined,
                        existingSessionId: storedSessionId || undefined,
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
                        localStorage.setItem("analytics_session_id", data.sessionId)
                    }
                }
            } catch (e) {
                console.error("Failed to init analytics session", e)
            }
        }

        initSession()
    }, [isTelegramInitialized, user])

    const track = async (eventType: string, metadata?: any) => {
        try {
            if (!sessionId) {
                // If session not ready, maybe queue? For MVP, skip or try best effort with local storage
            }

            // Use current state sessionId or fallback to local storage one if state not yet updated
            const currentSessionId = sessionId || localStorage.getItem("analytics_session_id")

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
