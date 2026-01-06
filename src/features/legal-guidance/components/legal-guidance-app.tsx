"use client"

import { useLegalGuidance } from "../hooks/use-legal-guidance"
import { HomeScreen } from "./screens/home-screen"
import { CategoriesScreen } from "./screens/categories-screen"
import { QuestionsScreen } from "./screens/questions-screen"
import { AnswerScreen } from "./screens/answer-screen"
import { AnimatePresence, motion } from "framer-motion"
import { useTelegramBackButton, useTelegramHaptic } from "@/src/features/telegram"

import { useEffect } from "react"

export function LegalGuidanceApp() {
  const { screen, goBack, initialize } = useLegalGuidance()
  const { selectionChanged } = useTelegramHaptic()

  useEffect(() => {
    initialize("http://localhost:3000")
  }, [initialize])

  // Show back button on all screens except home
  const showBackButton = screen !== "home"

  // Handle Telegram back button
  useTelegramBackButton({
    visible: showBackButton,
    onBack: () => {
      selectionChanged() // Haptic feedback on back
      goBack()
    },
  })

  return (
    <div className="flex flex-col h-dvh bg-background">
      <AnimatePresence mode="wait">
        {screen === "home" && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col"
          >
            <HomeScreen />
          </motion.div>
        )}
        {screen === "categories" && (
          <motion.div
            key="categories"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col"
          >
            <CategoriesScreen />
          </motion.div>
        )}
        {screen === "questions" && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col"
          >
            <QuestionsScreen />
          </motion.div>
        )}
        {screen === "answer" && (
          <motion.div
            key="answer"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col"
          >
            <AnswerScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
