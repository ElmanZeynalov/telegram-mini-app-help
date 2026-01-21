import { ChevronLeft, ChevronRight, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Breadcrumb, AVAILABLE_LANGUAGES } from "../../types"

interface FlowHeaderProps {
    breadcrumbs: Breadcrumb[]
    navigateToBreadcrumb: (index: number) => void
    currentLangInfo: typeof AVAILABLE_LANGUAGES[0]
}

export function FlowHeader({
    breadcrumbs,
    navigateToBreadcrumb,
    currentLangInfo,
}: FlowHeaderProps) {
    if (breadcrumbs.length === 0) {
        return (
            <div className="border-b border-border bg-card p-4">
                <div className="text-muted-foreground text-sm">Select a category to start</div>
            </div>
        )
    }

    return (
        <div className="border-b border-border bg-card p-4">
            <div className="flex items-center gap-2 flex-wrap">
                {breadcrumbs.length > 1 && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigateToBreadcrumb(breadcrumbs.length - 2)}
                                    className="gap-1"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Back
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Go back to {breadcrumbs[breadcrumbs.length - 2]?.label || "previous level"}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
                <div className="flex items-center gap-1 text-sm">
                    {breadcrumbs.map((crumb, index) => (
                        <div key={crumb.id} className="flex items-center gap-1">
                            {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                            <button
                                onClick={() => navigateToBreadcrumb(index)}
                                className={`px-2 py-1 rounded hover:bg-muted transition-colors ${index === breadcrumbs.length - 1 ? "font-medium text-foreground" : "text-muted-foreground"
                                    }`}
                            >
                                {crumb.label}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-2 cursor-help">
                                    <Globe className="w-4 h-4" />
                                    Editing in:{" "}
                                    <span className="font-medium text-foreground">
                                        {currentLangInfo.flag} {currentLangInfo.name}
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>All new content will be saved in {currentLangInfo.name}</p>
                                <p className="text-xs text-muted-foreground">Change the language from the sidebar dropdown</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </div>
    )
}
