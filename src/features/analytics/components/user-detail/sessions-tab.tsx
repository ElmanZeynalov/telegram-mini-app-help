import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock } from "lucide-react"
import { format } from "date-fns"
import { AnalyticsSession } from "@/types/analytics"

interface SessionsTabProps {
    sessions: AnalyticsSession[] | undefined
}

export function SessionsTab({ sessions }: SessionsTabProps) {
    return (
        <ScrollArea className="h-full">
            <div className="p-6 space-y-3">
                {sessions?.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                            <div className="flex flex-col">
                                <span className="font-medium text-sm">Session Started</span>
                                <span className="text-xs text-muted-foreground font-mono">Ref: {session.id.slice(0, 8)}</span>
                            </div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground font-mono">
                            {format(new Date(session.startTime), "PP p")}
                        </div>
                    </div>
                ))}
                {(!sessions || sessions.length === 0) && (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                        <Clock className="h-8 w-8 mb-2 opacity-20" />
                        <p>No sessions found</p>
                    </div>
                )}
            </div>
        </ScrollArea>
    )
}
