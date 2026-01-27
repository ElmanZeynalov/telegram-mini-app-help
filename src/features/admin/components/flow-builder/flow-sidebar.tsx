import { useState } from "react"
import {
    FolderTree,
    Languages,
    ChevronDown,
    Check,
    AlertCircle,
    Search,
    Plus,
    X,
    GripVertical,
    ArrowUp,
    ArrowDown,
    Pencil,
    Trash2,
    BarChart2
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider
} from "@/components/ui/tooltip"
import { AVAILABLE_LANGUAGES, Category, TranslatedString } from "../../types"
import { t } from "../../utils"
import { TranslationBadge } from "../ui/translation-badge"

interface FlowSidebarProps {
    categories: Category[]
    selectedCategory: string | null
    currentLang: string
    currentLangInfo: typeof AVAILABLE_LANGUAGES[0]
    missingTranslationsCount: number
    onSetCurrentLang: (code: string) => void
    onSelectCategory: (id: string) => void
    onAddCategory: (name: string) => void
    onUpdateCategory: (id: string, name: string) => void
    onDeleteCategory: (id: string, name: string) => void
    onReorderCategory: (id: string, direction: "up" | "down") => void
    onOpenTranslationModal: (type: "category", id: string, field: "name") => void

    // Drag and drop props
    draggedCategoryId: string | null
    dragOverCategoryId: string | null
    onDragStart: (e: React.DragEvent, id: string) => void
    onDragOver: (e: React.DragEvent, id: string) => void
    onDragLeave: () => void
    onDrop: (e: React.DragEvent, id: string) => void
    onDragEnd: () => void
}

export function FlowSidebar({
    categories,
    selectedCategory,
    currentLang,
    currentLangInfo,
    missingTranslationsCount,
    onSetCurrentLang,
    onSelectCategory,
    onAddCategory,
    onUpdateCategory,
    onDeleteCategory,
    onReorderCategory,
    onOpenTranslationModal,
    draggedCategoryId,
    dragOverCategoryId,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd
}: FlowSidebarProps) {
    const [categorySearch, setCategorySearch] = useState("")
    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
    const [newCategoryName, setNewCategoryName] = useState("")
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
    const [editingCategoryName, setEditingCategoryName] = useState("")

    const filteredCategories = categories.filter((cat) =>
        t(cat.name, currentLang).toLowerCase().includes(categorySearch.toLowerCase())
    )

    const handleCreateCategory = () => {
        if (newCategoryName.trim()) {
            onAddCategory(newCategoryName)
            setNewCategoryName("")
            setShowAddCategoryModal(false)
        }
    }

    const handleUpdateCategory = (id: string) => {
        if (editingCategoryName.trim()) {
            onUpdateCategory(id, editingCategoryName)
            setEditingCategoryId(null)
            setEditingCategoryName("")
        }
    }

    return (
        <div className="w-80 border-r border-border bg-card flex flex-col h-full">
            <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                    <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <FolderTree className="w-5 h-5 text-primary" />
                        Flow Builder
                    </h1>
                    <Link href="/stats">
                        <Button variant="default" size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                            <BarChart2 className="w-4 h-4" />
                            Analytics
                        </Button>
                    </Link>
                </div>

                {/* Language Selector */}
                <div className="flex items-center gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex-1">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="gap-2 w-full justify-start bg-transparent">
                                                <Languages className="w-4 h-4" />
                                                <span className="flex-1 text-left">
                                                    {currentLangInfo.flag} {currentLangInfo.name}
                                                </span>
                                                <ChevronDown className="w-4 h-4 opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="w-48">
                                            {AVAILABLE_LANGUAGES.map((lang) => (
                                                <DropdownMenuItem
                                                    key={lang.code}
                                                    onClick={() => onSetCurrentLang(lang.code)}
                                                    className="flex items-center gap-2"
                                                >
                                                    <span>{lang.flag}</span>
                                                    <span>{lang.name}</span>
                                                    {currentLang === lang.code && <Check className="w-4 h-4 ml-auto" />}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p className="font-medium">Current editing language</p>
                                <p className="text-xs text-muted-foreground">
                                    Switch to view and edit content in different languages
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {missingTranslationsCount > 0 && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30 cursor-help">
                                        <AlertCircle className="w-3 h-3 mr-1" />
                                        {missingTranslationsCount}
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="max-w-xs">
                                    <p className="font-medium">{missingTranslationsCount} missing translations</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Some categories, questions, or answers are missing translations.
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            </div>

            <div className="p-3 space-y-3 border-b border-border">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search categories..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className="pl-9 bg-muted/50 border-border text-foreground text-sm"
                    />
                </div>

                <Button onClick={() => setShowAddCategoryModal(true)} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Category
                </Button>
            </div>

            {showAddCategoryModal && (
                <div className="p-3 border-b border-border bg-primary/5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">New Category</span>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => {
                                setShowAddCategoryModal(false)
                                setNewCategoryName("")
                            }}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="space-y-2">
                        <Input
                            placeholder={`Category name (${currentLangInfo.name})`}
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
                            className="bg-input border-border text-foreground text-sm"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <Button onClick={handleCreateCategory} disabled={!newCategoryName.trim()} className="flex-1" size="sm">
                                <Check className="w-4 h-4 mr-1" />
                                Create Category
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setShowAddCategoryModal(false)
                                    setNewCategoryName("")
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredCategories.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        {categorySearch ? (
                            <div className="space-y-1">
                                <Search className="w-8 h-8 mx-auto opacity-50" />
                                <p className="text-sm">No categories match "{categorySearch}"</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <FolderTree className="w-8 h-8 mx-auto opacity-50" />
                                <p className="text-sm">No categories yet</p>
                                <p className="text-xs opacity-70">Click "Add New Category" to get started</p>
                            </div>
                        )}
                    </div>
                ) : (
                    filteredCategories.map((category, index) => {
                        // Note: questionCount logic depends on questions, which we don't have here efficiently unless passed.
                        // For now I'll just skip displaying question count OR I need to pass questions or count function.
                        // Let's modify props to accept `getQuestionCount` or just ignore for a sec.
                        // Actually, I should just pass `categories` which might include `_count` if I was using Prisma directly, but here it's Frontend Type.
                        // I'll add `getQuestionCount` prop.

                        const isSelected = selectedCategory === category.id
                        const isDragOver = dragOverCategoryId === category.id
                        const isDragging = draggedCategoryId === category.id

                        return (
                            <div
                                key={category.id}
                                draggable
                                onDragStart={(e) => onDragStart(e, category.id)}
                                onDragOver={(e) => onDragOver(e, category.id)}
                                onDragLeave={onDragLeave}
                                onDrop={(e) => onDrop(e, category.id)}
                                onDragEnd={onDragEnd}
                                className={`transition-all duration-200 ${isDragging ? "opacity-50" : ""} ${isDragOver ? "border-t-2 border-primary" : ""}`}
                            >
                                {editingCategoryId === category.id ? (
                                    <div className="flex items-center gap-1 p-2">
                                        <Input
                                            value={editingCategoryName}
                                            onChange={(e) => setEditingCategoryName(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleUpdateCategory(category.id)}
                                            className="h-8 text-sm"
                                            autoFocus
                                        />
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8"
                                            onClick={() => handleUpdateCategory(category.id)}
                                        >
                                            <Check className="w-4 h-4 text-green-500" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8"
                                            onClick={() => setEditingCategoryId(null)}
                                        >
                                            <X className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div
                                        className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${isSelected
                                            ? "bg-primary/20 text-primary"
                                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        <div className="flex items-center gap-1">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded">
                                                            <GripVertical className="w-4 h-4 text-muted-foreground" />
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="right">
                                                        <p>Drag to reorder</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <div className="flex flex-col">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-4 w-4 p-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        onReorderCategory(category.id, "up")
                                                    }}
                                                    disabled={index === 0}
                                                >
                                                    <ArrowUp className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-4 w-4 p-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        onReorderCategory(category.id, "down")
                                                    }}
                                                    disabled={index === filteredCategories.length - 1}
                                                >
                                                    <ArrowDown className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0" onClick={() => onSelectCategory(category.id)}>
                                            <div className="flex items-center gap-2">
                                                <span className="truncate text-sm font-medium">{t(category.name, currentLang)}</span>
                                                <TranslationBadge
                                                    translations={category.name}
                                                    onClick={() => onOpenTranslationModal("category", category.id, "name")}
                                                />
                                            </div>
                                            {/* Removed question count for now to simplify props */}
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setEditingCategoryId(category.id)
                                                    setEditingCategoryName(t(category.name, currentLang))
                                                }}
                                            >
                                                <Pencil className="w-3 h-3" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7 text-destructive hover:text-destructive"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    const categoryName = t(category.name, currentLang)
                                                    onDeleteCategory(category.id, categoryName)
                                                }}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
