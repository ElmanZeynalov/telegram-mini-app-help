"use client"

import type React from "react"

import { useState, useEffect, Suspense, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  MessageSquare,
  FileText,
  FolderTree,
  Edit2,
  Languages,
  GripVertical,
  Globe,
  AlertCircle
} from "lucide-react"
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import RichTextEditor from "@/features/admin/components/ui/rich-text-editor"
import MarkdownPreview from "@/features/admin/components/ui/markdown-preview"
import { ConfirmDialog } from "@/features/admin/components/ui/confirm-dialog"
import { toast } from "sonner"
import { TranslationBadge } from "@/features/admin/components/ui/translation-badge"
import { FlowSidebar } from "@/features/admin/components/flow-builder/flow-sidebar"
import { TranslationModal } from "@/features/admin/components/modals/translation-modal"
import { FlowHeader } from "@/features/admin/components/flow-builder/flow-header"
import { QuestionList } from "@/features/admin/components/flow-builder/question-list"
import {
  AVAILABLE_LANGUAGES,
  TranslatedString,
  Category,
  Question,
  Breadcrumb,
  ActivePanel
} from "@/features/admin/types"
import { getTranslationStatus, t, updateQuestionRecursively } from "@/features/admin/utils"
import { useFlowData } from "@/features/admin/hooks/use-flow-data"
import { useFlowActions } from "@/features/admin/hooks/use-flow-actions"
import { useDragDrop } from "@/features/admin/hooks/use-drag-drop"


function FlowBuilderContent() {
  const { flows, setFlows, isLoading, findQuestionById } = useFlowData()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null) // Changed from string to string | null
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([])
  const [currentLang, setCurrentLang] = useState("az") // Renamed to currentLang
  const currentLangInfo = AVAILABLE_LANGUAGES.find((l) => l.code === currentLang) || AVAILABLE_LANGUAGES[0]

  const {
    // State
    activePanel,
    deleteConfirm,
    setDeleteConfirm,
    newQuestionText,
    setNewQuestionText,
    answerForm,
    setAnswerForm,
    answerAttachment,
    setAnswerAttachment,
    subQuestionForm,
    setSubQuestionForm,
    editForm,
    setEditForm,
    editAttachment,
    setEditAttachment,
    translationModal,
    setTranslationModal,
    translationForms,
    setTranslationForms,
    isUploading,
    // allowDragRef removed from here, coming from useDragDrop

    // Actions
    handleFileUpload,
    addCategory,
    updateCategory,
    handleDeleteCategory,
    deleteCategory,
    confirmDelete,
    reorderCategory,
    handleDeleteQuestion,
    deleteQuestion,
    addQuestion,
    saveAnswer,
    addSubQuestion,
    saveEdit,
    deleteAttachment,
    openPanel,
    closePanel,
    navigateInto,
    navigateToBreadcrumb,
    openTranslationModal,
    saveTranslations,
    getMissingTranslationsCount
  } = useFlowActions({
    flows,
    setFlows,
    currentLang,
    selectedCategory,
    setSelectedCategory,
    breadcrumbs,
    setBreadcrumbs,
    findQuestionById
  })

  // Destructure DragDrop hook
  const {
    draggedCategoryId,
    dragOverCategoryId,
    draggedQuestionId,
    dragOverQuestionId,
    allowDragRef,
    handleCategoryDragStart,
    handleCategoryDragOver,
    handleCategoryDragLeave,
    handleCategoryDrop,
    handleCategoryDragEnd,
    handleQuestionDragStart,
    handleQuestionDragOver,
    handleQuestionDragLeave,
    handleQuestionDrop,
    handleQuestionDragEnd
  } = useDragDrop({ flows, setFlows, selectedCategory })



  useEffect(() => {
    if (selectedCategory) {
      const category = flows.categories.find((c) => c.id === selectedCategory)
      if (category) {
        setBreadcrumbs([
          {
            id: selectedCategory,
            label: t(category.name, currentLang), // Using t() with currentLang
            type: "category",
          },
        ])
      }
    } else {
      setBreadcrumbs([])
    }
  }, [selectedCategory, flows.categories, currentLang])

  // Helper functions




  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }






  const getQuestionsAtLevel = (): Question[] => {
    if (!selectedCategory) return []

    const parentId = breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 1].id : null

    if (parentId) {
      const parentQuestion = findQuestionById(parentId)
      return (parentQuestion?.subQuestions || []).sort((a, b) => a.order - b.order)
    } else {
      return flows.questions.filter((q) => q.categoryId === selectedCategory).sort((a, b) => a.order - b.order)
    }
  }

  const currentQuestions = getQuestionsAtLevel()



  const missingCount = getMissingTranslationsCount()

  return (
    <TooltipProvider>
      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title={deleteConfirm?.type === "category" ? "Delete Category" : "Delete Question"}
        description={
          deleteConfirm?.type === "category"
            ? `Are you sure you want to delete "${deleteConfirm?.name}"? All questions in this category will also be deleted. This action cannot be undone.`
            : `Are you sure you want to delete this question? ${deleteConfirm?.name ? `"${deleteConfirm.name}"` : ""} All nested sub-questions will also be deleted. This action cannot be undone.`
        }
        confirmText="Delete"
        variant="danger"
      />

      <div className="flex h-screen bg-background text-foreground">
        {/* Left Sidebar - Categories */}
        <FlowSidebar
          categories={flows.categories}
          selectedCategory={selectedCategory}
          currentLang={currentLang}
          currentLangInfo={currentLangInfo}
          missingTranslationsCount={missingCount}
          onSetCurrentLang={setCurrentLang}
          onSelectCategory={setSelectedCategory}
          onAddCategory={addCategory}
          onUpdateCategory={updateCategory}
          onDeleteCategory={handleDeleteCategory}
          onReorderCategory={reorderCategory}
          onOpenTranslationModal={openTranslationModal}
          draggedCategoryId={draggedCategoryId}
          dragOverCategoryId={dragOverCategoryId}
          onDragStart={handleCategoryDragStart}
          onDragOver={handleCategoryDragOver}
          onDragLeave={handleCategoryDragLeave}
          onDrop={handleCategoryDrop}
          onDragEnd={handleCategoryDragEnd}
        />


        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Breadcrumbs Header */}
          <FlowHeader
            breadcrumbs={breadcrumbs}
            navigateToBreadcrumb={navigateToBreadcrumb}
            currentLangInfo={currentLangInfo}
          />

          {/* Questions Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedCategory ? (
              <div className="max-w-4xl mx-auto space-y-4">
                {/* Add Question Form */}
                <Card className="border-dashed border-2 border-border bg-card/50">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add New Question ({currentLangInfo.flag} {currentLangInfo.name})
                      </label>
                    </div>
                    <RichTextEditor
                      value={newQuestionText}
                      onChange={setNewQuestionText}
                      placeholder={`Type a new question with formatting...`}
                      compact
                      rows={2}
                      onSubmit={() => {
                        if (newQuestionText.trim()) {
                          addQuestion(newQuestionText, selectedCategory)
                        }
                      }}
                    />
                    <div className="flex justify-end">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => addQuestion(newQuestionText, selectedCategory)}
                            disabled={!newQuestionText.trim()}
                            className="gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Add Question
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p>Creates a question - add answers or sub-questions after</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </CardContent>
                </Card>

                <div className="text-xs text-muted-foreground mb-2 flex justify-between">
                  <span>Questions in DB: {flows.questions.length}</span>
                </div>
                <QuestionList
                  questions={currentQuestions}
                  currentLang={currentLang}
                  currentLangInfo={currentLangInfo}
                  activePanel={activePanel}
                  draggedQuestionId={draggedQuestionId}
                  dragOverQuestionId={dragOverQuestionId}
                  onDragStart={handleQuestionDragStart}
                  onDragOver={handleQuestionDragOver}
                  onDragLeave={handleQuestionDragLeave}
                  onDrop={(e, id) => handleQuestionDrop(e, id, breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 1].id : undefined)}
                  onDragEnd={handleQuestionDragEnd}
                  onDragHandleDown={(allow) => { allowDragRef.current = allow }}
                  onOpenTranslation={openTranslationModal}
                  onDelete={handleDeleteQuestion}
                  onDeleteAttachment={deleteAttachment}
                  onNavigateInto={navigateInto}
                  onPanelAction={openPanel}
                  onClosePanel={closePanel}
                  answerForm={answerForm}
                  setAnswerForm={setAnswerForm}
                  subQuestionForm={subQuestionForm}
                  setSubQuestionForm={setSubQuestionForm}
                  editForm={editForm}
                  setEditForm={setEditForm}
                  answerAttachment={answerAttachment}
                  setAnswerAttachment={setAnswerAttachment}
                  editAttachment={editAttachment}
                  setEditAttachment={setEditAttachment}
                  onSaveAnswer={saveAnswer}
                  onAddSubQuestion={addSubQuestion}
                  onSaveEdit={saveEdit}
                  handleFileUpload={handleFileUpload}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <FolderTree className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <h2 className="text-xl font-medium mb-2">Select a Category</h2>
                  <p className="text-sm">Choose a category from the sidebar or create a new one</p>
                </div>
              </div>
            )}
          </div >
        </div >

        {translationModal && (
          <TranslationModal
            isOpen={!!translationModal}
            onClose={() => setTranslationModal(null)}
            onSave={saveTranslations}
            type={translationModal.type}
            field={translationModal.field}
            id={translationModal.id}
            translationForms={translationForms}
            setTranslationForms={setTranslationForms}
            handleFileUpload={handleFileUpload}
            getAttachment={(langCode) => {
              const question = findQuestionById(translationModal.id)
              const t = question?.translations?.find((tr: any) => tr.language === langCode)
              if (t?.attachmentName) {
                return { url: t.attachmentUrl, name: t.attachmentName }
              }
              return null
            }}
          />
        )}
      </div >
    </TooltipProvider >
  )
}

export default function FlowBuilder() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <FlowBuilderContent />
    </Suspense>
  )
}
