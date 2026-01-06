"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useLegalGuidance } from "../../hooks/use-legal-guidance"
import { ArrowRight, Globe } from "lucide-react"
import { CenteredContentLayout } from "../layout/centered-content-layout"
import { LanguageSheet } from "@/src/features/i18n/components/language-sheet"
import { LANGUAGES } from "@/src/features/i18n/constants/languages"
import { FeministIcon } from "@/src/assets/icons"

export function HomeScreen() {
  const { setScreen, t, locale } = useLegalGuidance()
  const [languageSheetOpen, setLanguageSheetOpen] = useState(false)
  const currentLang = LANGUAGES.find((l) => l.code === locale)

  // Language selector as a subtle footer element
  const languageFooter = (
    <div className="flex justify-center">
      <button
        onClick={() => setLanguageSheetOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full 
                   bg-muted/50 hover:bg-muted active:bg-muted/80
                   text-muted-foreground hover:text-foreground
                   transition-colors duration-200"
      >
        <Globe className="h-4 w-4" />
        <span className="text-sm font-medium">{currentLang?.nativeName}</span>
      </button>
    </div>
  )

  return (
    <>
      <CenteredContentLayout footer={languageFooter}>
        {/* App icon - Feminist Venus symbol */}
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-8 shadow-sm">
          <FeministIcon className="w-12 h-12 text-primary" />
        </div>

        {/* Welcome text */}
        <h1 className="text-2xl font-semibold text-foreground mb-3 tracking-tight">
          {t("welcome")}
        </h1>

        <p className="text-muted-foreground mb-10 max-w-xs leading-relaxed">
          {t("welcomeSubtitle")}
        </p>

        {/* Primary CTA */}
        <Button
          size="lg"
          onClick={() => setScreen("categories")}
          className="px-8 h-14 text-base font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 gap-2"
        >
          {t("startButton")}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </CenteredContentLayout>

      {/* Language selection sheet */}
      <LanguageSheet open={languageSheetOpen} onOpenChange={setLanguageSheetOpen} />
    </>
  )
}
