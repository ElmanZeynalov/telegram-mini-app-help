import { ChevronLeft, ChevronRight, Globe, User, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { Breadcrumb, AVAILABLE_LANGUAGES } from "../../types"

interface FlowHeaderProps {
    breadcrumbs: Breadcrumb[]
    navigateToBreadcrumb: (index: number) => void
    currentLangInfo: typeof AVAILABLE_LANGUAGES[0]
    user: any // We'll assume the user object is passed here
}

export function FlowHeader({
    breadcrumbs,
    navigateToBreadcrumb,
    currentLangInfo,
    user
}: FlowHeaderProps) {
    if (breadcrumbs.length === 0) {
        return (
            <div className="border-b border-border bg-card p-4 flex items-center justify-between">
                <div className="text-muted-foreground text-sm">Select a category to start</div>
                <div className="flex items-center gap-2">
                    {/* User Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                                    {user?.email?.charAt(0).toUpperCase() || "A"}
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user?.email}</p>
                                    <p className="text-xs leading-none text-muted-foreground capitalize">
                                        {user?.role}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/miniapp/admin/users" className="cursor-pointer w-full flex items-center">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={async () => {
                                try {
                                    await fetch('/api/auth/logout', { method: 'POST' })
                                    window.location.href = '/login'
                                } catch (error) {
                                    console.error('Logout failed:', error)
                                }
                            }}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
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

                <div className="ml-auto flex items-center gap-4 text-sm text-muted-foreground">
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

                    <div className="h-4 w-px bg-border mx-2" />

                    {/* User Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full border border-border p-0">
                                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                                    {user?.email?.charAt(0).toUpperCase() || "A"}
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user?.email}</p>
                                    <p className="text-xs leading-none text-muted-foreground capitalize">
                                        {user?.role}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/miniapp/admin/users" className="cursor-pointer w-full flex items-center">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={async () => {
                                try {
                                    await fetch('/api/auth/logout', { method: 'POST' })
                                    window.location.href = '/login'
                                } catch (error) {
                                    console.error('Logout failed:', error)
                                }
                            }}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    )
}
