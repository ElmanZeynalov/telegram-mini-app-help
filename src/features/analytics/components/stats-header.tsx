import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"

interface StatsHeaderProps {
    period: string
    setPeriod: (val: string) => void
    language: string
    setLanguage: (val: string) => void
    onExport: () => void
}

export function StatsHeader({ period, setPeriod, language, setLanguage, onExport }: StatsHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
                <p className="text-muted-foreground">
                    Overview of bot usage, content performance, and safety metrics.
                </p>
            </div>

            <div className="flex items-center gap-2">


                <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Languages</SelectItem>
                        <SelectItem value="az">Azerbaijani</SelectItem>
                        <SelectItem value="ru">Russian</SelectItem>
                    </SelectContent>
                </Select>

                <Tabs value={period} onValueChange={setPeriod} className="w-[300px]">
                    <TabsList>
                        <TabsTrigger value="7d">7 Days</TabsTrigger>
                        <TabsTrigger value="30d">30 Days</TabsTrigger>
                        <TabsTrigger value="90d">90 Days</TabsTrigger>
                    </TabsList>
                </Tabs>
                <Button variant="outline" size="sm" onClick={onExport} className="hidden sm:flex">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </div>
        </div>
    )
}
