"use client"

import { useLegalGuidance } from "../../hooks/use-legal-guidance"
import { NavigableContentLayout } from "../layout/navigable-content-layout"
import { HelpCircle, ChevronRight, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export function QuestionsScreen() {
  const { currentQuestions, currentQuestion, selectedCategory, selectQuestion, getText, t, navigationHistory } =
    useLegalGuidance()
  const [searchQuery, setSearchQuery] = useState("")

  const isNested = navigationHistory.length > 0

  const filteredQuestions = currentQuestions.filter((question) =>
    getText(question.question).toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <NavigableContentLayout>
      <div className="p-5 space-y-5">
        <div className="space-y-1.5">
          {selectedCategory && (
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">
              {getText(selectedCategory.name)}
            </p>
          )}
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            {isNested && currentQuestion?.question ? getText(currentQuestion.question) : t("questions")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("selectQuestion")}</p>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
          <Input
            placeholder={t("searchQuestions")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-card border-border/60 rounded-xl focus:ring-2 focus:ring-primary/20 transition-shadow"
          />
        </div>

        <div className="space-y-2.5">
          {filteredQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <HelpCircle className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <p className="text-muted-foreground">{searchQuery ? t("noSearchResults") : t("noQuestions")}</p>
            </div>
          ) : (
            filteredQuestions.map((question, index) => (
              <button
                key={question.id}
                onClick={() => selectQuestion(question)}
                className="w-full p-4 text-left bg-card hover:bg-accent/50 rounded-xl border border-border/40 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 group"
              >
                <div className="flex gap-3.5 items-center">
                  <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary/10 text-primary text-sm flex items-center justify-center font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-foreground leading-relaxed">{getText(question.question)}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </NavigableContentLayout>
  )
}
