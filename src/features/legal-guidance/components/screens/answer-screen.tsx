"use client"

import { useLegalGuidance } from "../../hooks/use-legal-guidance"
import { NavigableContentLayout } from "../layout/navigable-content-layout"
import { Button } from "@/components/ui/button"
import { FileQuestion, RotateCcw } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { AnswerFeedback } from "../feedback/answer-feedback"

import { useTelegram } from "@/src/features/telegram/hooks/use-telegram"

export function AnswerScreen() {
  const { currentAnswer, currentAttachment, breadcrumbs, goToCategories, t, selectedCategory, getText } = useLegalGuidance()
  const { webApp } = useTelegram()

  const questionLabel = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].label : ""

  const footer = (
    <Button
      onClick={goToCategories}
      className="w-full h-14 rounded-xl text-base font-medium shadow-md hover:shadow-lg transition-all duration-200 gap-2"
      size="lg"
    >
      <RotateCcw className="w-4 h-4" />
      {t("askAnotherQuestion")}
    </Button>
  )

  return (
    <NavigableContentLayout footer={footer}>
      <div className="p-5 space-y-5">
        <div className="space-y-1.5">
          {selectedCategory && (
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">
              {getText(selectedCategory.name)}
            </p>
          )}
          <h1 className="text-xl font-semibold text-foreground tracking-tight leading-snug">{questionLabel}</h1>
          <p className="text-sm text-muted-foreground">{t("answer")}</p>
        </div>

        {currentAnswer ? (
          <>
            {/* Answer card */}
            <div className="bg-card rounded-2xl border border-border/40 shadow-sm p-5 space-y-4">
              <div className="prose-answer text-card-foreground">
                <ReactMarkdown
                  components={{
                    a: ({ node, href, children, ...props }) => {
                      const handleClick = (e: React.MouseEvent) => {
                        e.preventDefault()
                        e.stopPropagation()

                        if (href) {
                          if (webApp) {
                            webApp.openLink(href, { try_instant_view: true })
                          } else {
                            // Fallback for browser testing
                            window.open(href, "_blank", "noreferrer")
                          }
                        }
                      }

                      // We render a span instead of 'a' to guarantee no default browser behavior
                      // But style it exactly like a link
                      return (
                        <span
                          onClick={handleClick}
                          className="text-blue-600 dark:text-blue-400 font-medium hover:underline break-words cursor-pointer"
                          {...props}
                        >
                          {children}
                        </span>
                      )
                    }
                  }}
                >
                  {currentAnswer}
                </ReactMarkdown>
              </div>

              {/* Attachment Download Button */}
              {currentAttachment && (
                <div className="pt-2 border-t border-border/50">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 h-auto py-3 px-4 border-dashed"
                    onClick={() => {
                      if (webApp) {
                        webApp.openLink(currentAttachment.url)
                      } else {
                        window.open(currentAttachment.url, "_blank")
                      }
                    }}
                  >
                    <div className="bg-primary/10 p-2 rounded-md">
                      <span className="text-xl">📄</span>
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-medium text-sm truncate text-foreground">{currentAttachment.name}</p>
                      <p className="text-xs text-muted-foreground">{t("downloadFile")}</p>
                    </div>
                  </Button>
                </div>
              )}
            </div>

            {/* Feedback section - appears after the answer */}
            <AnswerFeedback />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <FileQuestion className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <p className="text-muted-foreground">{t("noAnswer")}</p>
          </div>
        )}
      </div>
    </NavigableContentLayout>
  )
}
