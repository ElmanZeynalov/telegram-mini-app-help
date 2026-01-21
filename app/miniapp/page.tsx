import { LegalGuidanceApp } from "@/src/features/legal-guidance/components/legal-guidance-app"
import { AnalyticsProvider } from "@/src/features/analytics/context/analytics-context"

export default function Home() {
  return (
    <AnalyticsProvider>
      <LegalGuidanceApp />
    </AnalyticsProvider>
  )
}
