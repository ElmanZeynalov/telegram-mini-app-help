"use client"

import { createContext } from "react"

export interface TelegramContextValue {
  /**
   * Whether the Telegram SDK has been initialized
   */
  isInitialized: boolean
  /**
   * Whether the app is running inside Telegram
   */
  isTelegram: boolean
  /**
   * Error that occurred during initialization, if any
   */
  error: Error | null
}

export const TelegramContext = createContext<TelegramContextValue | null>(null)

