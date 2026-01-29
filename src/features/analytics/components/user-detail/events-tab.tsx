import { useMemo } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, FolderOpen, FileText, List, CornerDownRight, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { AnalyticsEvent, SessionGroup } from "@/types/analytics"
import { getLocalizedText } from "../../utils"

interface EventsTabProps {
    events: AnalyticsEvent[] | undefined
}

export function EventsTab({ events }: EventsTabProps) {
    // Memoize the heavy event processing logic
    const sessionGroups = useMemo(() => {
        if (!events) return [];

        const eventsBySession: Record<string, AnalyticsEvent[]> = {};
        events.forEach((event) => {
            const sessionId = event.sessionId || 'unknown';
            if (!eventsBySession[sessionId]) eventsBySession[sessionId] = [];
            eventsBySession[sessionId].push(event);
        });

        const sortedSessionIds = Object.keys(eventsBySession).sort((a, b) => {
            const dateA = new Date(eventsBySession[a][0].createdAt).getTime();
            const dateB = new Date(eventsBySession[b][0].createdAt).getTime();
            return dateB - dateA;
        });

        return sortedSessionIds.map((sessionId, sessionIndex) => {
            const sessionEvents = eventsBySession[sessionId];

            // Deduplicate
            const processedEvents = sessionEvents.reduce((acc: AnalyticsEvent[], event: AnalyticsEvent) => {
                const prev = acc[acc.length - 1];
                if (prev &&
                    prev.eventType === event.eventType &&
                    Math.abs(new Date(event.createdAt).getTime() - new Date(prev.createdAt).getTime()) < 5000 &&
                    JSON.stringify(prev.metadata) === JSON.stringify(event.metadata)
                ) return acc;
                acc.push(event);
                return acc;
            }, []);

            if (processedEvents.length === 0) return null;

            const sessionDate = processedEvents[processedEvents.length - 1].createdAt;

            return {
                sessionId,
                sessionIndex,
                processedEvents,
                sessionDate
            };
        }).filter((group): group is SessionGroup => group !== null);
    }, [events]);

    return (
        <ScrollArea className="h-full pr-4">
            <div className="p-6 space-y-8">
                {sessionGroups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                        <Clock className="h-8 w-8 mb-2 opacity-20" />
                        <p>No events recorded</p>
                    </div>
                ) : (
                    sessionGroups.map((group) => {
                        const { sessionId, sessionIndex, processedEvents, sessionDate } = group;
                        const sessionNumber = sessionGroups.length - sessionIndex;

                        return (
                            <div key={sessionId} className="relative mb-8 rounded-xl border-2 bg-card shadow-md overflow-hidden">
                                {/* Session Header */}
                                <div className="flex items-center gap-3 border-b p-4 bg-muted/30">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
                                        <span className="font-bold text-sm">#{sessionNumber}</span>
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-foreground">Session Started</div>
                                        <div className="text-xs text-muted-foreground font-mono">
                                            {format(new Date(sessionDate), "PPP p")}
                                        </div>
                                    </div>
                                </div>

                                {/* Events Stacking */}
                                <div className="space-y-0 relative pl-2 p-4 pt-6">
                                    {/* Vertical Line for Events within Session */}
                                    <div className="absolute left-[29px] top-4 bottom-8 w-px bg-border/60" />

                                    {processedEvents.map((event: any, index: number) => {
                                        const isCategory = event.eventType === 'view_category';
                                        const isQuestion = event.eventType === 'view_question';
                                        const isSubQuestion = event.eventType === 'view_question_list';
                                        const isFeedback = event.eventType.includes('feedback');
                                        const isEmergency = event.eventType === 'emergency_exit';
                                        const isSessionEnd = event.eventType === 'session_end';

                                        let Icon = FileText;
                                        let iconColor = "text-blue-500 bg-blue-500/10 border-blue-500/20";

                                        if (isCategory) {
                                            Icon = FolderOpen;
                                            iconColor = "text-amber-500 bg-amber-500/10 border-amber-500/20";
                                        } else if (isQuestion) {
                                            Icon = event.metadata?.isParent ? List : FileText;
                                            iconColor = "text-indigo-500 bg-indigo-500/10 border-indigo-500/20";
                                        } else if (isSubQuestion) {
                                            Icon = CornerDownRight;
                                            iconColor = "text-purple-500 bg-purple-500/10 border-purple-500/20";
                                        } else if (isFeedback) {
                                            Icon = event.eventType === 'feedback_yes' ? CheckCircle2 : XCircle;
                                            iconColor = event.eventType === 'feedback_yes'
                                                ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                                                : "text-rose-500 bg-rose-500/10 border-rose-500/20";
                                        } else if (isEmergency) {
                                            Icon = AlertTriangle;
                                            iconColor = "text-red-600 bg-red-600/10 border-red-600/20";
                                        } else if (isSessionEnd) {
                                            Icon = Clock;
                                            iconColor = "text-slate-500 bg-slate-500/10 border-slate-500/20";
                                        }

                                        return (
                                            <div key={event.id} className="relative pl-10 py-2 group">
                                                {/* Event Icon */}
                                                <div className={`absolute left-[21px] top-3 h-4 w-4 rounded-full ${iconColor} border flex items-center justify-center ring-4 ring-background z-10 transition-transform group-hover:scale-110`}>
                                                    <Icon className="w-2.5 h-2.5" />
                                                </div>

                                                <div className="flex flex-col gap-1 p-3 rounded-lg hover:bg-muted/40 border border-transparent hover:border-border/40 transition-colors">
                                                    <div className="flex items-center justify-between gap-4">
                                                        <Badge variant="outline" className={`text-[10px] uppercase tracking-wider h-5 bg-background/50 font-normal ${isSessionEnd ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>
                                                            {event.eventType.replace('_', ' ')}
                                                        </Badge>
                                                        <span className="text-[10px] text-muted-foreground font-mono opacity-50">
                                                            {format(new Date(event.createdAt), "HH:mm:ss")}
                                                        </span>
                                                    </div>

                                                    <div className="text-sm">
                                                        {isCategory && (
                                                            <span>Selected Category: <span className="font-semibold text-foreground">"{getLocalizedText(event.metadata, 'name')}"</span></span>
                                                        )}
                                                        {isQuestion && (
                                                            <span>
                                                                {event.metadata?.isParent ? 'Browsing Questions in: ' : 'Viewing Question: '}
                                                                <span className="font-semibold text-foreground">"{getLocalizedText(event.metadata, 'question') || getLocalizedText(event.metadata, 'title')}"</span>
                                                            </span>
                                                        )}
                                                        {isSubQuestion && (
                                                            <span>
                                                                Sub-Question: <span className="font-semibold text-foreground">"{getLocalizedText(event.metadata, 'question') || getLocalizedText(event.metadata, 'title')}"</span>
                                                            </span>
                                                        )}
                                                        {isFeedback && (
                                                            <span className={event.eventType === 'feedback_yes' ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}>
                                                                {event.eventType === 'feedback_yes' ? 'Found Answer Helpful' : 'Found Answer Not Helpful'}: "{getLocalizedText(event.metadata, 'questionText')}"
                                                            </span>
                                                        )}
                                                        {isEmergency && <span className="text-red-600 font-bold">⚠️ Triggered Emergency Exit</span>}
                                                        {isSessionEnd && <span className="text-muted-foreground font-medium italic">User closed the application</span>}

                                                        {!isCategory && !isQuestion && !isSubQuestion && !isFeedback && !isEmergency && !isSessionEnd && (
                                                            <span className="text-muted-foreground">Interaction recorded</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </ScrollArea>
    )
}
