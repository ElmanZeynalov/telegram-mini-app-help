"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, User, Calendar, Clock, MapPin, Globe, X, FolderOpen, FileText, List, CornerDownRight, MessageCircle, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface UserDetailDialogProps {
    userId: string | null
    onClose: () => void
}

export function UserDetailDialog({ userId, onClose }: UserDetailDialogProps) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return
            setLoading(true)
            try {
                const res = await fetch(`/api/admin/users/${userId}`)
                if (!res.ok) throw new Error('Failed')
                const json = await res.json()
                setData(json)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [userId])

    // Helper to extract localized text safely
    const getLocalizedText = (obj: any, key: string) => {
        if (!obj) return 'Unknown'
        const val = obj[key]
        if (typeof val === 'string') return val
        if (typeof val === 'object' && val !== null) {
            return val.en || val.az || val.ru || Object.values(val)[0] || 'Unknown'
        }
        return 'Unknown'
    }

    const { user, sessions, events, feedback } = data || {}

    return (
        <Dialog open={!!userId} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="!max-w-[80vw] !w-[80vw] h-[85vh] p-0 gap-0 overflow-hidden flex flex-col md:flex-row bg-background">
                {/* Left Sidebar: User Identity */}
                <div className="w-full md:w-80 border-b md:border-b-0 md:border-r bg-muted/10 p-6 flex flex-col gap-6 shrink-0 relative">
                    <DialogHeader className="p-0 flex flex-row items-center justify-between">
                        <DialogTitle className="text-xl">User Profile</DialogTitle>
                    </DialogHeader>

                    {/* Add a close button specifically requested by user */}
                    <div className="absolute top-4 right-4 md:hidden">
                        <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : !data ? (
                        <div className="text-center text-muted-foreground">User not found</div>
                    ) : (
                        <>
                            <div className="flex flex-col items-center text-center gap-3">
                                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary ring-4 ring-background shadow-sm">
                                    {user.firstName?.[0] || user.username?.[0] || "?"}
                                </div>
                                <div className="space-y-1 w-full">
                                    <h3 className="font-semibold text-lg truncate" title={`${user.firstName} ${user.lastName}`}>
                                        {user.firstName} {user.lastName}
                                    </h3>
                                    {user.username && (
                                        <Badge variant="secondary" className="font-mono text-xs">
                                            @{user.username}
                                        </Badge>
                                    )}
                                    <p className="text-xs text-muted-foreground pt-1 font-mono">ID: {user.telegramId}</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4 text-sm">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="text-muted-foreground flex items-center gap-2">
                                        <Globe className="h-4 w-4" /> Language
                                    </div>
                                    <div className="font-medium text-right uppercase">{user.language}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="text-muted-foreground flex items-center gap-2">
                                        <MapPin className="h-4 w-4" /> Region
                                    </div>
                                    <div className="font-medium text-right truncate">{user.region || 'Unknown'}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="text-muted-foreground flex items-center gap-2">
                                        <Calendar className="h-4 w-4" /> Joined
                                    </div>
                                    <div className="font-medium text-right">{format(new Date(user.createdAt), "MMM d, yyyy")}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="text-muted-foreground flex items-center gap-2">
                                        <Clock className="h-4 w-4" /> Sessions
                                    </div>
                                    <div className="font-medium text-right">{user._count?.sessions || 0}</div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Right Content: Activity */}
                <div className="flex-1 flex flex-col min-h-0 bg-background/50">
                    {data && (
                        <Tabs defaultValue="events" className="flex-1 flex flex-col min-h-0">
                            <div className="px-6 py-4 border-b flex items-center justify-between bg-background sticky top-0 z-10">
                                <h3 className="font-semibold text-lg">Activity History</h3>
                                <TabsList>
                                    <TabsTrigger value="events">Events</TabsTrigger>
                                    <TabsTrigger value="sessions">Sessions</TabsTrigger>
                                    <TabsTrigger value="feedback">Feedback</TabsTrigger>
                                </TabsList>
                            </div>

                            <div className="flex-1 overflow-hidden relative">
                                <TabsContent value="events" className="h-full m-0 absolute inset-0">
                                    <ScrollArea className="h-full pr-4">
                                        <div className="p-6 space-y-8">
                                            {(() => {
                                                const eventsBySession: Record<string, any[]> = {};
                                                events?.forEach((event: any) => {
                                                    const sessionId = event.sessionId || 'unknown';
                                                    if (!eventsBySession[sessionId]) eventsBySession[sessionId] = [];
                                                    eventsBySession[sessionId].push(event);
                                                });

                                                const sortedSessionIds = Object.keys(eventsBySession).sort((a, b) => {
                                                    const dateA = new Date(eventsBySession[a][0].createdAt).getTime();
                                                    const dateB = new Date(eventsBySession[b][0].createdAt).getTime();
                                                    return dateB - dateA;
                                                });

                                                if (sortedSessionIds.length === 0) {
                                                    return (
                                                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                                                            <Clock className="h-8 w-8 mb-2 opacity-20" />
                                                            <p>No events recorded</p>
                                                        </div>
                                                    );
                                                }

                                                return sortedSessionIds.map((sessionId, sessionIndex) => {
                                                    const sessionEvents = eventsBySession[sessionId];

                                                    // Deduplicate
                                                    const processedEvents = sessionEvents.reduce((acc: any[], event: any) => {
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
                                                    const isLastSession = sessionIndex === sortedSessionIds.length - 1;

                                                    return (
                                                        <div key={sessionId} className="relative pl-6">
                                                            {/* Session Connector Line */}
                                                            {!isLastSession && (
                                                                <div className="absolute left-[30px] top-8 bottom-[-32px] w-px bg-border/60" />
                                                            )}

                                                            {/* Session Header */}
                                                            <div className="flex items-center gap-3 mb-6 relative z-10">
                                                                <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm ring-4 ring-background">
                                                                    <Clock className="w-4 h-4" />
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-semibold text-foreground">Session Started</div>
                                                                    <div className="text-xs text-muted-foreground font-mono">
                                                                        {format(new Date(sessionDate), "PPP p")}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Events Stacking */}
                                                            <div className="space-y-0 relative pl-0">
                                                                {/* Vertical Line for Events within Session */}
                                                                <div className="absolute left-[15px] top-0 bottom-4 w-px bg-border/60" />

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
                                                                        Icon = Clock; // Or a stop icon
                                                                        iconColor = "text-slate-500 bg-slate-500/10 border-slate-500/20";
                                                                    }

                                                                    return (
                                                                        <div key={event.id} className="relative pl-10 py-2 group">
                                                                            {/* Event Icon */}
                                                                            <div className={`absolute left-[7px] top-3 h-4 w-4 rounded-full ${iconColor} border flex items-center justify-center ring-4 ring-background z-10 transition-transform group-hover:scale-110`}>
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
                                                });
                                            })()}
                                        </div>
                                    </ScrollArea>
                                </TabsContent>

                                <TabsContent value="sessions" className="h-full m-0 absolute inset-0">
                                    <ScrollArea className="h-full">
                                        <div className="p-6 space-y-3">
                                            {sessions?.map((session: any) => (
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
                                </TabsContent>

                                <TabsContent value="feedback" className="h-full m-0 absolute inset-0">
                                    <ScrollArea className="h-full">
                                        <div className="p-6 grid gap-4 grid-cols-1">
                                            {feedback?.map((item: any) => (
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
                                </TabsContent>
                            </div>
                        </Tabs>
                    )}
                </div>

                <div className="absolute right-4 top-4 z-50">
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close</span>
                    </Button>
                </div>
            </DialogContent>
        </Dialog >
    )
}
