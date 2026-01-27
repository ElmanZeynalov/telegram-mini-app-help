import { useRef } from "react"
import {
    GripVertical,
    FileText,
    FolderTree,
    AlertCircle,
    Trash2,
    Plus,
    Edit2,
    ChevronRight,
    Languages
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip"
import MarkdownPreview from "@/features/admin/components/ui/markdown-preview"
import RichTextEditor from "@/features/admin/components/ui/rich-text-editor"
import { TranslationBadge } from "../ui/translation-badge"
import { Question, ActivePanel, AVAILABLE_LANGUAGES, TranslatedString } from "../../types"
import { t } from "../../utils"

interface QuestionItemProps {
    question: Question
    currentLang: string
    currentLangInfo: typeof AVAILABLE_LANGUAGES[0]
    activePanel: ActivePanel | null

    // Drag and Drop
    isDragging: boolean
    isDragOver: boolean
    onDragStart: (e: React.DragEvent, id: string) => void
    onDragOver: (e: React.DragEvent, id: string) => void
    onDragLeave: () => void
    onDrop: (e: React.DragEvent, id: string) => void
    onDragEnd: () => void
    onDragHandleDown: (allow: boolean) => void

    // Actions
    onOpenTranslation: (type: "question", id: string, field: "name" | "question" | "answer") => void
    onDelete: (id: string, text: string) => void
    onDeleteAttachment: (id: string, url: string) => void
    onNavigateInto: (question: Question) => void
    onPanelAction: (id: string, action: "answer" | "subquestion" | "edit", question: Question) => void
    onClosePanel: () => void

    // Forms State & Handlers
    answerForm: string
    setAnswerForm: (val: string) => void
    subQuestionForm: string
    setSubQuestionForm: (val: string) => void
    editForm: { question: string; answer: string }
    setEditForm: (val: { question: string; answer: string }) => void

    // Attachments State
    answerAttachment: { url: string; name: string } | null
    setAnswerAttachment: (val: { url: string; name: string } | null) => void
    editAttachment: { url: string; name: string } | null
    setEditAttachment: (val: { url: string; name: string } | null) => void

    // Logic Handlers
    onSaveAnswer: (id: string) => void
    onAddSubQuestion: (id: string) => void
    onSaveEdit: (id: string) => void
    handleFileUpload: (file: File) => Promise<{ url: string; name: string } | null>
}

export function QuestionItem({
    question,
    currentLang,
    currentLangInfo,
    activePanel,
    isDragging,
    isDragOver,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd,
    onDragHandleDown,
    onOpenTranslation,
    onDelete,
    onDeleteAttachment,
    onNavigateInto,
    onPanelAction,
    onClosePanel,

    answerForm,
    setAnswerForm,
    subQuestionForm,
    setSubQuestionForm,
    editForm,
    setEditForm,
    answerAttachment,
    setAnswerAttachment,
    editAttachment,
    setEditAttachment,
    onSaveAnswer,
    onAddSubQuestion,
    onSaveEdit,
    handleFileUpload
}: QuestionItemProps) {
    const hasAnswer = question.answer && Object.values(question.answer).some((v) => v?.trim())
    const hasSubQuestions = question.subQuestions && question.subQuestions.length > 0
    const currentAnswer = question.answer?.[currentLang] || ""
    const isActive = activePanel?.questionId === question.id

    return (
        <Card
            draggable
            onDragStart={(e) => onDragStart(e, question.id)}
            onDragOver={(e) => onDragOver(e, question.id)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, question.id)}
            onDragEnd={onDragEnd}
            onMouseDown={(e) => {
                const target = e.target as HTMLElement
                if (target.closest(".drag-handle")) {
                    onDragHandleDown(true)
                } else {
                    onDragHandleDown(false)
                }
            }}
            className={`bg-card border-border transition-all duration-200 ${isDragging ? "opacity-50 scale-[0.98]" : ""
                } ${isDragOver ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
        >
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-2">
                        <div className="flex items-center gap-1 pt-1">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded drag-handle">
                                            <GripVertical className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Drag to reorder</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        <div className="flex-1">
                            <div className="flex items-start gap-2 flex-wrap">
                                <h3 className="font-medium text-foreground">{t(question.question, currentLang)}</h3>
                                <TranslationBadge
                                    translations={question.question}
                                    onClick={() => onOpenTranslation("question", question.id, "question")}
                                />
                            </div>

                            {/* Status Badges */}
                            <div className="flex items-center gap-2 mt-2">
                                {hasAnswer && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Badge variant="secondary" className="text-xs gap-1 cursor-help">
                                                    <FileText className="w-3 h-3" />
                                                    Has Answer
                                                    <TranslationBadge
                                                        translations={question.answer}
                                                        onClick={() => onOpenTranslation("question", question.id, "answer")}
                                                    />
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>This question has an answer configured</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                                {hasSubQuestions && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Badge variant="secondary" className="text-xs gap-1 cursor-help">
                                                    <FolderTree className="w-3 h-3" />
                                                    {question.subQuestions!.length} Sub-Questions
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>This question has {question.subQuestions!.length} nested question(s)</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Click "View Sub-Questions" to manage them
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                                {!hasAnswer && !hasSubQuestions && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs text-amber-500 border-amber-500/50 cursor-help"
                                                >
                                                    <AlertCircle className="w-3 h-3 mr-1" />
                                                    Needs content
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="font-medium">Incomplete question</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Add an answer, sub-questions, or both to complete this question
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                            const questionText = question.question[currentLang] || question.question["en"] || ""
                            const truncated =
                                questionText.length > 50 ? questionText.slice(0, 50) + "..." : questionText
                            onDelete(question.id, truncated)
                        }}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>

                {/* Show current answer preview if exists */}
                {currentAnswer && activePanel?.questionId !== question.id && (
                    <div className="mb-3 p-3 bg-muted/50 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            Answer ({currentLangInfo.name}):
                        </div>
                        <div className="text-sm text-foreground line-clamp-2">
                            <MarkdownPreview content={currentAnswer} />
                        </div>
                        {question.attachments?.[currentLang] && (
                            <div className="mt-2 flex items-center justify-between bg-background border border-border/50 rounded px-2 py-1.5 w-full max-w-xs">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <span className="text-lg">📎</span>
                                    <span className="text-xs font-medium truncate">{question.attachments[currentLang]?.name}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-1"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        if (question.attachments?.[currentLang]?.url) {
                                            onDeleteAttachment(question.id, question.attachments[currentLang]!.url)
                                        }
                                    }}
                                >
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                    <Button
                        variant={
                            activePanel?.questionId === question.id && activePanel.panel === "answer"
                                ? "default"
                                : "outline"
                        }
                        size="sm"
                        onClick={() =>
                            isActive && activePanel.panel === "answer"
                                ? onClosePanel()
                                : onPanelAction(question.id, "answer", question)
                        }
                        className="gap-1"
                    >
                        <FileText className="w-4 h-4" />
                        {hasAnswer ? "Edit Answer" : "Add Answer"}
                    </Button>

                    <Button
                        variant={
                            activePanel?.questionId === question.id && activePanel.panel === "subquestion"
                                ? "default"
                                : "outline"
                        }
                        size="sm"
                        onClick={() =>
                            isActive && activePanel.panel === "subquestion"
                                ? onClosePanel()
                                : onPanelAction(question.id, "subquestion", question)
                        }
                        className="gap-1"
                    >
                        <Plus className="w-4 h-4" />
                        Add Sub-Question
                    </Button>

                    <Button
                        variant={
                            activePanel?.questionId === question.id && activePanel.panel === "edit"
                                ? "default"
                                : "outline"
                        }
                        size="sm"
                        onClick={() =>
                            isActive && activePanel.panel === "edit"
                                ? onClosePanel()
                                : onPanelAction(question.id, "edit", question)
                        }
                        className="gap-1"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit
                    </Button>

                    {hasSubQuestions && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => onNavigateInto(question)}
                                        className="gap-1 ml-auto"
                                    >
                                        View Sub-Questions
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>
                                        Navigate into this question to manage its {question.subQuestions!.length} nested
                                        question(s)
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>

                {/* Expandable Panels */}
                {isActive && activePanel && (
                    <div className="mt-4 pt-4 border-t border-border">
                        {activePanel.panel === "answer" && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Answer ({currentLangInfo.name})
                                    </label>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onOpenTranslation("question", question.id, "answer")}
                                        className="gap-1 text-xs"
                                    >
                                        <Languages className="w-3 h-3" />
                                        Manage All Languages
                                    </Button>
                                </div>
                                <RichTextEditor
                                    value={answerForm}
                                    onChange={setAnswerForm}
                                    onFileSelect={async (file) => {
                                        if (!file) return
                                        const result = await handleFileUpload(file)
                                        if (result) setAnswerAttachment(result)
                                    }}
                                />
                                {answerAttachment && (
                                    <div className="text-xs text-blue-600 flex items-center justify-between bg-muted/30 p-2 rounded border border-dashed border-blue-200">
                                        <span className="flex items-center gap-2">📎 {answerAttachment.name}</span>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 rounded-full" onClick={() => setAnswerAttachment(null)}>×</Button>
                                    </div>
                                )}
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="sm" onClick={onClosePanel}>
                                        Cancel
                                    </Button>
                                    <Button size="sm" onClick={() => onSaveAnswer(question.id)}>
                                        Save Answer
                                    </Button>
                                </div>
                            </div>
                        )}

                        {activePanel.panel === "subquestion" && (
                            <div className="space-y-3">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <FolderTree className="w-4 h-4" />
                                    Add Sub-Question ({currentLangInfo.flag} {currentLangInfo.name})
                                </label>
                                <RichTextEditor
                                    value={subQuestionForm}
                                    onChange={setSubQuestionForm}
                                    placeholder="Type sub-question with formatting..."
                                    compact
                                    rows={2}
                                    onSubmit={() => {
                                        if (subQuestionForm.trim()) {
                                            onAddSubQuestion(question.id)
                                        }
                                    }}
                                />
                                <div className="flex items-center justify-between">
                                    {hasSubQuestions && (
                                        <div className="text-xs text-muted-foreground">
                                            {question.subQuestions!.length} sub-question(s) already added
                                        </div>
                                    )}
                                    <div className="flex gap-2 ml-auto">
                                        <Button
                                            onClick={() => onAddSubQuestion(question.id)}
                                            disabled={!subQuestionForm.trim()}
                                        >
                                            Add
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={onClosePanel}>
                                            Done
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activePanel.panel === "edit" && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">
                                        Edit Question ({currentLangInfo.flag} {currentLangInfo.name})
                                    </label>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onOpenTranslation("question", question.id, "question")}
                                        className="gap-1 text-xs"
                                    >
                                        <Languages className="w-3 h-3" />
                                        Manage All Languages
                                    </Button>
                                </div>
                                <RichTextEditor
                                    value={editForm.question}
                                    onChange={(val) => setEditForm({ ...editForm, question: val })}
                                    placeholder="Edit question text..."
                                    compact
                                    rows={2}
                                />
                                <label className="text-sm font-medium">Answer (optional)</label>
                                <RichTextEditor
                                    value={editForm.answer}
                                    onChange={(v) => setEditForm({ ...editForm, answer: v })}
                                    onFileSelect={async (file) => {
                                        if (!file) return
                                        const result = await handleFileUpload(file)
                                        if (result) setEditAttachment(result)
                                    }}
                                />
                                {editAttachment && (
                                    <div className="text-xs text-blue-600 flex items-center justify-between bg-muted/30 p-2 rounded border border-dashed border-blue-200">
                                        <span className="flex items-center gap-2">📎 {editAttachment.name}</span>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 rounded-full" onClick={() => setEditAttachment(null)}>×</Button>
                                    </div>
                                )}
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="sm" onClick={onClosePanel}>
                                        Cancel
                                    </Button>
                                    <Button size="sm" onClick={() => onSaveEdit(question.id)}>
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
