import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { AnalyticsEvent } from "@/types/analytics"

interface FeedbackTabProps {
    feedback: AnalyticsEvent[] | undefined
}

export function FeedbackTab({ feedback }: FeedbackTabProps) {
    return (
        <ScrollArea className="h-full">
            <div className="p-6 grid gap-4 grid-cols-1">
                {feedback?.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                        <div className={`h-1 w-full ${item.eventType === 'feedback_yes' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div className="p-4">
                            <div className="flex items-start justify-between gap-4 mb-2">
                                <Badge variant={item.eventType === 'feedback_yes' ? 'default' : 'destructive'} className={item.eventType === 'feedback_yes' ? 'bg-green-600 hover:bg-green-700' : ''}>
                                    {item.eventType === 'feedback_yes' ? 'Helpful' : 'Not Helpful'}
                                </Badge>
                                <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                                    {format(new Date(item.createdAt), "PP p")}
                                </span>
                            </div>
                            <p className="text-sm font-medium leading-relaxed">
                                {item.metadata?.questionText || "Unknown Question Context"}
                            </p>
                        </div>
                    </Card>
                ))}
                {(!feedback || feedback.length === 0) && (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                        <div className="h-10 w-10 text-4xl mb-2 grayscale opacity-50">💬</div>
                        <p>No feedback provided yet</p>
                    </div>
                )}
            </div>
        </ScrollArea>
    )
}
