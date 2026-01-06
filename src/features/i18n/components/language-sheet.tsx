"use client"

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Check } from "lucide-react"
import { useLocaleStore } from "../stores/locale-store"
import { LANGUAGES } from "../constants/languages"
import type { Locale } from "@/src/types"

interface LanguageSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LanguageSheet({ open, onOpenChange }: LanguageSheetProps) {
  const { locale, setLocale, t } = useLocaleStore()

  const handleLanguageSelect = (code: Locale) => {
    setLocale(code)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl px-5 pt-3 pb-8 border-t-0 shadow-2xl [&>button]:hidden">
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        <SheetTitle className="text-center text-lg font-semibold mb-5">{t("selectLanguage")}</SheetTitle>

        <div className="space-y-2.5">
          {LANGUAGES.map((lang) => {
            const isSelected = locale === lang.code

            return (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className={`
                  w-full flex items-center justify-between 
                  px-4 py-4 rounded-xl
                  text-base font-medium
                  transition-all duration-200
                  ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted/50 text-foreground hover:bg-muted active:scale-[0.98]"
                  }
                `}
              >
                <span>{lang.nativeName}</span>
                {isSelected && <Check className="h-5 w-5" strokeWidth={2.5} />}
              </button>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
