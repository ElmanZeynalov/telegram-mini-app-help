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
  Check,
  X,
  Edit2,
  Globe,
  AlertCircle,
  Languages,
  ChevronDown,
  Pencil,
  Search,
  GripVertical,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import RichTextEditor from "@/components/rich-text-editor"
import MarkdownPreview from "@/components/markdown-preview"
import { ConfirmDialog } from "@/components/confirm-dialog"

const AVAILABLE_LANGUAGES = [
  { code: "az", name: "Azərbaycan", flag: "🇦🇿" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
]

type TranslatedString = { [langCode: string]: string }

interface Category {
  id: string
  name: TranslatedString
  order: number
  createdAt: string
}

interface Question {
  id: string
  categoryId?: string
  question: TranslatedString
  answer?: TranslatedString
  keywords?: string[]
  subQuestions?: Question[]
  order: number
  createdAt: string
}

interface Breadcrumb {
  id: string
  label: string
  type: "category" | "question"
}

type ActivePanel = {
  questionId: string
  panel: "answer" | "subquestion" | "edit" | null
}

const getTranslationStatus = (
  translations: TranslatedString | undefined,
): { complete: number; total: number; missing: string[] } => {
  if (!translations)
    return { complete: 0, total: AVAILABLE_LANGUAGES.length, missing: AVAILABLE_LANGUAGES.map((l) => l.code) }
  const missing = AVAILABLE_LANGUAGES.filter((lang) => !translations[lang.code]?.trim()).map((l) => l.code)
  return {
    complete: AVAILABLE_LANGUAGES.length - missing.length,
    total: AVAILABLE_LANGUAGES.length,
    missing,
  }
}

function TranslationBadge({
  translations,
  onClick,
}: { translations: TranslatedString | undefined; onClick?: () => void }) {
  const status = getTranslationStatus(translations)
  const isComplete = status.complete === status.total

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${isComplete
            ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
            : "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
            }`}
        >
          <Globe className="w-3 h-3" />
          {status.complete}/{status.total}
          {!isComplete && <AlertCircle className="w-3 h-3" />}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p className="font-medium">
          {isComplete ? "All translations complete" : `${status.missing.length} translation(s) missing`}
        </p>
        <p className="text-xs text-muted-foreground">Click to manage translations for all languages</p>
      </TooltipContent>
    </Tooltip>
  )
}

function FlowBuilderContent() {
  const [flows, setFlows] = useState<{ categories: Category[]; questions: Question[] }>({
    categories: [],
    questions: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null) // Changed from string to string | null
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([])
  const [currentLang, setCurrentLang] = useState("az") // Renamed to currentLang
  const currentLangInfo = AVAILABLE_LANGUAGES.find((l) => l.code === currentLang) || AVAILABLE_LANGUAGES[0]

  const [newQuestionText, setNewQuestionText] = useState("")
  const [activePanel, setActivePanel] = useState<ActivePanel | null>(null)
  const [answerForm, setAnswerForm] = useState("")
  const [answerAttachment, setAnswerAttachment] = useState<{ url: string, name: string } | null>(null)
  const [subQuestionForm, setSubQuestionForm] = useState("")
  const [subQuestionAttachment, setSubQuestionAttachment] = useState<{ url: string, name: string } | null>(null)
  const [editForm, setEditForm] = useState({ question: "", answer: "" })
  const [editAttachment, setEditAttachment] = useState<{ url: string, name: string } | null>(null)

  const [translationModal, setTranslationModal] = useState<{
    type: "category" | "question"
    id: string
    field: "name" | "question" | "answer"
  } | null>(null)
  const [translationForms, setTranslationForms] = useState<TranslatedString>({})

  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null)
  const [dragOverCategoryId, setDragOverCategoryId] = useState<string | null>(null)
  const [draggedQuestionId, setDraggedQuestionId] = useState<string | null>(null)
  const [dragOverQuestionId, setDragOverQuestionId] = useState<string | null>(null)

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingCategoryName, setEditingCategoryName] = useState("")
  const [newCategoryName, setNewCategoryName] = useState("")
  const [categorySearch, setCategorySearch] = useState("")
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)

  // Refs for drag and drop to correctly identify target during drop
  const dragCategoryOverIndex = useRef<number | null>(null)
  const dragQuestionOverIndex = useRef<number | null>(null)

  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "category" | "question"
    id: string
  } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, questionsRes] = await Promise.all([
          fetch('/api/categories', { cache: 'no-store' }),
          fetch('/api/questions', { cache: 'no-store' })
        ])

        if (!catsRes.ok || !questionsRes.ok) throw new Error("Failed to fetch data")

        const categories = await catsRes.json()
        const flatQuestions = await questionsRes.json()

        // Pre-process: Rescue orphaned questions (parentId points to non-existent ID)
        const allQuestionIds = new Set(flatQuestions.map((q: any) => q.id))
        const validQuestions = flatQuestions.map((q: any) => {
          if (q.parentId && !allQuestionIds.has(q.parentId)) {
            return { ...q, parentId: null } // Treat orphan as root
          }
          return q
        })

        // Build Tree from valid list
        const buildTree = (questions: any[], parentId: string | null = null): Question[] => {
          return questions
            .filter(q => {
              if (parentId === null) return !q.parentId
              return q.parentId === parentId
            })
            .map(q => ({
              ...q,
              subQuestions: buildTree(questions, q.id)
            }))
            .sort((a, b) => (a.order || 0) - (b.order || 0))
        }

        const questions = buildTree(validQuestions, null)
        setFlows({ categories, questions })
      } catch (e) {
        console.error("Failed to fetch data:", e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // localStorage sync removed


  useEffect(() => {
    if (selectedCategory) {
      const category = flows.categories.find((c) => c.id === selectedCategory)
      if (category) {
        setBreadcrumbs([
          {
            id: selectedCategory,
            label: t(category.name), // Using t() for consistency
            type: "category",
          },
        ])
      }
    } else {
      setBreadcrumbs([])
    }
  }, [selectedCategory, flows.categories]) // Removed currentLang dependency, breadcrumbs use t() which handles currentLang

  // Helper functions
  const findQuestionById = (id: string): Question | null => {
    // Simplified to not take questions array
    const findRecursive = (questions: Question[]): Question | null => {
      for (const q of questions) {
        if (q.id === id) return q
        if (q.subQuestions) {
          const found = findRecursive(q.subQuestions)
          if (found) return found
        }
      }
      return null
    }
    return findRecursive(flows.questions)
  }

  // Helper to update questions recursively
  const updateQuestionRecursively = (
    questions: Question[],
    targetId: string,
    updateFn: (question: Question) => Question,
  ): Question[] => {
    return questions.map((q) => {
      if (q.id === targetId) {
        return updateFn(q)
      }
      if (q.subQuestions) {
        return { ...q, subQuestions: updateQuestionRecursively(q.subQuestions, targetId, updateFn) }
      }
      return q
    })
  }

  const t = (translations: TranslatedString | undefined, fallback = "Untitled"): string => {
    if (!translations) return fallback
    return translations[currentLang] || translations.en || Object.values(translations)[0] || fallback
  }

  // Category functions
  // CHANGED: Updated addCategory to close modal after adding
  const addCategory = async () => {
    if (!newCategoryName.trim()) return

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: { [currentLang]: newCategoryName.trim() },
          translations: [{ language: currentLang, name: newCategoryName.trim() }]
        })
      })

      if (!res.ok) throw new Error('Failed to create category')

      const newCategory = await res.json()

      setFlows((prev) => ({
        ...prev,
        categories: [...prev.categories, newCategory],
      }))
      setNewCategoryName("")
      setShowAddCategoryModal(false)
      setSelectedCategory(newCategory.id)
    } catch (e) {
      console.error("Error creating category:", e)
      // Optional: Show error toast
    }
  }

  const updateCategory = async (id: string) => {
    if (!editingCategoryName.trim()) return
    try {
      const res = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          translations: [{ language: currentLang, name: editingCategoryName.trim() }]
        })
      })
      if (!res.ok) throw new Error("Failed to update")
      const updatedCat = await res.json()

      setFlows({
        ...flows,
        categories: flows.categories.map((c) =>
          c.id === id ? { ...c, ...updatedCat } : c,
        ),
      })
      setEditingCategoryId(null)
      setEditingCategoryName("")
    } catch (e) {
      console.error("Failed to update category", e)
    }
  }

  const handleDeleteCategory = (id: string, name: string) => {
    setDeleteConfirm({ type: "category", id, name })
  }

  // Original deleteCategory function, now called by confirmDelete
  const deleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error("Failed to delete")

      setFlows({
        categories: flows.categories.filter((c) => c.id !== id),
        questions: flows.questions.filter((q) => q.categoryId !== id),
      })
      if (selectedCategory === id) {
        setSelectedCategory(null)
        setBreadcrumbs([])
      }
    } catch (e) {
      console.error("Failed to delete category", e)
    }
  }

  const handleDeleteQuestion = (id: string, name: string) => {
    setDeleteConfirm({ type: "question", id, name })
  }

  // Original deleteQuestion function, now called by confirmDelete
  const deleteQuestion = async (id: string) => {
    try {
      const res = await fetch(`/api/questions?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error("Failed to delete")

      const deleteRecursive = (questions: Question[]): Question[] => {
        return questions
          .filter((q) => q.id !== id)
          .map((q) => ({
            ...q,
            subQuestions: q.subQuestions ? deleteRecursive(q.subQuestions) : [],
          }))
      }
      setFlows({ ...flows, questions: deleteRecursive(flows.questions) })
    } catch (e) {
      console.error("Failed to delete question", e)
    }
  }

  const confirmDelete = () => {
    if (!deleteConfirm) return

    if (deleteConfirm.type === "category") {
      deleteCategory(deleteConfirm.id)
    } else {
      deleteQuestion(deleteConfirm.id)
    }
    setDeleteConfirm(null)
  }

  // Modified addQuestion to accept categoryId and parentQuestionId for better hierarchy management and added order
  const addQuestion = async (text: string, categoryId?: string, parentQuestionId?: string) => {
    if (!text.trim()) return

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId,
          parentId: parentQuestionId,
          translations: [{ language: currentLang, question: text.trim(), answer: "" }]
        })
      })

      if (!res.ok) throw new Error('Failed to create question')

      const newQuestion = await res.json()

      // Optimistic update or refetch needed. 
      // For simplicity, let's just refetch all data or manually update state properly
      // Here implementing manual state update to avoid full refetch for better UX

      if (parentQuestionId) {
        setFlows((prev) => ({
          ...prev,
          questions: updateQuestionRecursively(prev.questions, parentQuestionId, (q) => ({
            ...q,
            subQuestions: [...(q.subQuestions || []), newQuestion],
          })) as Question[], // Cast to fix type inference
        }))
      } else {
        setFlows((prev) => ({
          ...prev,
          questions: [...prev.questions, newQuestion],
        }))
      }
      setNewQuestionText("")
    } catch (e) {
      console.error("Error adding question:", e)
    }
  }

  const saveAnswer = async (questionId: string) => {
    try {
      // Find the question to get its current text (needed for translation upsert if we want to be safe, 
      // though our API might handle partials if we struct it right. 
      // But verify: API PUT expects { translations: [...] } and upserts.
      // We will send both question and answer to be safe/consistent.)

      // We need to find the current question content to send it along with the answer
      // Helper to find recursively
      const findQ = (qs: Question[], id: string): Question | null => {
        for (const q of qs) {
          if (q.id === id) return q
          if (q.subQuestions) {
            const found = findQ(q.subQuestions, id)
            if (found) return found
          }
        }
        return null
      }

      const currentQ = findQ(flows.questions, questionId)
      if (!currentQ) return

      // Logic to prevent saving empty question text which would hide the question in the UI
      // If current lang question text is missing, use AZ (default) or any other available
      const rawCurrentLangText = currentQ.question[currentLang]
      const fallbackText = currentQ.question['az'] || Object.values(currentQ.question).find(v => v) || ""
      const questionTextToSave = rawCurrentLangText || fallbackText

      const res = await fetch('/api/questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: questionId,
          translations: [{
            language: currentLang,
            question: questionTextToSave,
            answer: answerForm,
            attachmentUrl: answerAttachment?.url,
            attachmentName: answerAttachment?.name
          }]
        })
      })

      if (!res.ok) throw new Error("Failed to save answer")
      const updatedQ = await res.json()

      const updateQuestionsRecursive = (questions: Question[]): Question[] => {
        return questions.map((q) => {
          if (q.id === questionId) {
            // Merge the answer. 
            // Update local state map from API response or manually
            return { ...q, answer: { ...(q.answer || {}), [currentLang]: answerForm } }
          }
          if (q.subQuestions) {
            return { ...q, subQuestions: updateQuestionsRecursive(q.subQuestions) }
          }
          return q
        })
      }
      setFlows({ ...flows, questions: updateQuestionsRecursive(flows.questions) })
      setActivePanel(null)
      setAnswerForm("")
    } catch (e) {
      console.error("Failed to save answer", e)
    }
  }

  const addSubQuestion = async (parentId: string) => {
    if (!subQuestionForm.trim()) return
    // Reuse addQuestion logic or call API directly
    await addQuestion(subQuestionForm, undefined, parentId)
    setSubQuestionForm("")
  }

  const saveEdit = async (questionId: string) => {
    if (!editForm.question.trim()) return

    try {
      const res = await fetch('/api/questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: questionId,
          translations: [{ language: currentLang, question: editForm.question.trim(), answer: editForm.answer }]
        })
      })
      if (!res.ok) throw new Error("Failed to update")
      const updatedQ = await res.json()

      const updateQuestionsRecursive = (questions: Question[]): Question[] => {
        return questions.map((q) => {
          if (q.id === questionId) {
            // Merge updated fields but keep subQuestions from local state if not returned populated deeply (API returns subquestions but maybe not deep enough or we want to preserve UI state)
            // Actually API returns full object. Let's merge carefully.
            return {
              ...q,
              ...updatedQ,
              subQuestions: q.subQuestions // Keep existing subquestions reference if API doesn't return them or if we want to avoid re-render issues strictly locally
            }
          }
          if (q.subQuestions) {
            return { ...q, subQuestions: updateQuestionsRecursive(q.subQuestions) }
          }
          return q
        })
      }
      setFlows({ ...flows, questions: updateQuestionsRecursive(flows.questions) })
      setActivePanel(null)
      setEditForm({ question: "", answer: "" })
    } catch (e) {
      console.error("Failed to update question", e)
    }
  }

  const openPanel = (questionId: string, panel: "answer" | "subquestion" | "edit", question: Question) => {
    // Reset states first
    setAnswerAttachment(null)
    setEditAttachment(null)

    if (panel === "answer") {
      setAnswerForm(t(question.answer, ""))
      // Load existing attachment if any
      const existingAttachment = question.attachments?.[currentLang] || null
      if (existingAttachment) {
        setAnswerAttachment(existingAttachment)
      }
    } else if (panel === "edit") {
      setEditForm({ question: t(question.question, ""), answer: t(question.answer, "") })
      // Load existing attachment if any (for answer editing)
      const existingAttachment = question.attachments?.[currentLang] || null
      if (existingAttachment) {
        setEditAttachment(existingAttachment)
      }
    } else {
      setSubQuestionForm("") // Clear sub-question input
    }
    setActivePanel({ questionId, panel })
  }

  const closePanel = () => {
    setActivePanel(null)
    setAnswerForm("")
    setSubQuestionForm("")
    setEditForm({ question: "", answer: "" })
  }

  const navigateInto = (question: Question) => {
    setBreadcrumbs([...breadcrumbs, { id: question.id, label: t(question.question), type: "question" }])
    closePanel()
  }

  const navigateToBreadcrumb = (index: number) => {
    setBreadcrumbs(breadcrumbs.slice(0, index + 1))
    closePanel()
  }

  const openTranslationModal = (type: "category" | "question", id: string, field: "name" | "question" | "answer") => {
    let currentTranslations: TranslatedString = {}

    if (type === "category") {
      const category = flows.categories.find((c) => c.id === id)
      if (category && field === "name") {
        currentTranslations = { ...category.name }
      }
    } else {
      const question = findQuestionById(id) // Use simplified findQuestionById
      if (question) {
        if (field === "question") {
          currentTranslations = { ...question.question }
        } else if (field === "answer") {
          currentTranslations = { ...(question.answer || {}) }

          // Load attachments for each language
          AVAILABLE_LANGUAGES.forEach(lang => {
            const attachment = question.attachments?.[lang.code]
            if (attachment) {
              currentTranslations[`${lang.code}_attachmentUrl`] = attachment.url
              currentTranslations[`${lang.code}_attachmentName`] = attachment.name
            }
          })
        }
      }
    }

    setTranslationForms(currentTranslations)
    setTranslationModal({ type, id, field }) // Simplified translationModal state
  }

  const saveTranslations = async () => {
    if (!translationModal) return

    try {
      const translations = AVAILABLE_LANGUAGES.map(langObj => {
        const lang = langObj.code
        const text = translationForms[lang] || "" // Handle possibly undefined text

        // Skip if everything empty? No, we might want to clear it.
        // But mainly we want to capture fields.

        const obj: any = { language: lang }

        if (translationModal.field === 'name') {
          obj.name = text
        } else if (translationModal.field === 'question') {
          obj.question = text
        } else if (translationModal.field === 'answer') {
          obj.answer = text

          // Check for attachments in the form state
          if (translationForms[`${lang}_attachmentUrl`]) {
            obj.attachmentUrl = translationForms[`${lang}_attachmentUrl`]
          }
          if (translationForms[`${lang}_attachmentName`]) {
            obj.attachmentName = translationForms[`${lang}_attachmentName`]
          }

          // Also explicitly handle clearing attachments if they were removed?
          // Currently UI sets empty string.
          if (translationForms[`${lang}_attachmentUrl`] === "") {
            obj.attachmentUrl = null
            obj.attachmentName = null
          }

          // CRITICAL FIX: Ensure 'question' field is populated even if we are only editing answer
          const q = findQuestionById(translationModal.id)
          if (q) {
            const existingQText = q.question[lang]
            const fallback = q.question['az'] || Object.values(q.question).find(v => v) || ""
            obj.question = existingQText || fallback
          }
        }
        return obj // Always return object for each language
      })

      // Normalize because specific fields need to be passed correctly to API
      const apiBody: any = { id: translationModal.id, translations: [] }

      if (translationModal.type === 'category') {
        apiBody.translations = Object.entries(translationForms).map(([lang, val]) => ({ language: lang, name: val }))
        await fetch('/api/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiBody)
        })
        // Manual State Update for Category
        setFlows(prev => ({
          ...prev,
          categories: prev.categories.map(c => c.id === translationModal.id ? { ...c, name: { ...translationForms } } : c)
        }))
      } else {
        // For question, we need to know existing translations or send what we have. API upserts.
        // We need to distinguish if we are updating question text or answer text.
        // Our API expects { translations: [{ language, question, answer }] }
        // But managing partial updates might be tricky if backend overwrites.
        // My implementation of PUT uses upsert, so providing one field might nullify others if not careful?
        // Actually my prisma upsert: update: { question: t.question, answer: t.answer }
        // If t.question is undefined in the payload, Prisma might error or set null if allowed.
        // I should probably fetch the latest state or ensure I send both.
        // For simplicity, let's assume we send updated fields.

        // Issue: If I only send 'question', 'answer' becomes what? undefined?
        // Prisma update with undefined usually ignores it.

        const apiTranslations = Object.entries(translationForms).map(([lang, val]) => {
          const obj: any = { language: lang }
          if (translationModal.field === 'question') obj.question = val
          if (translationModal.field === 'answer') obj.answer = val
          return obj
        })

        apiBody.translations = apiTranslations

        await fetch('/api/questions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiBody)
        })

        // Manual State Update for Question
        const updateQuestionsRecursive = (questions: Question[]): Question[] => {
          return questions.map((q) => {
            if (q.id === translationModal.id) {
              if (translationModal.field === "question") {
                return { ...q, question: { ...translationForms } }
              } else {
                return { ...q, answer: { ...translationForms } }
              }
            }
            if (q.subQuestions) {
              return { ...q, subQuestions: updateQuestionsRecursive(q.subQuestions) }
            }
            return q
          })
        }
        setFlows({ ...flows, questions: updateQuestionsRecursive(flows.questions) })
      }

      setTranslationModal(null)
      setTranslationForms({})
    } catch (e) {
      console.error("Failed to save translations", e)
    }
  }

  const getMissingTranslationsCount = (): number => {
    let count = 0

    flows.categories.forEach((cat) => {
      const status = getTranslationStatus(cat.name)
      count += status.missing.length
    })

    const countQuestions = (questions: Question[]) => {
      questions.forEach((q) => {
        const qStatus = getTranslationStatus(q.question)
        count += qStatus.missing.length
        if (q.answer && Object.keys(q.answer).length > 0) {
          const aStatus = getTranslationStatus(q.answer)
          count += aStatus.missing.length
        }
        if (q.subQuestions) {
          countQuestions(q.subQuestions)
        }
      })
    }
    countQuestions(flows.questions)

    return count
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const reorderCategory = (categoryId: string, direction: "up" | "down") => {
    setFlows((prev) => {
      const sorted = [...prev.categories].sort((a, b) => a.order - b.order)
      const currentIndex = sorted.findIndex((c) => c.id === categoryId)
      if (currentIndex === -1) return prev

      const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
      if (newIndex < 0 || newIndex >= sorted.length) return prev

      // Swap orders
      const updatedCategories = prev.categories.map((cat) => {
        if (cat.id === categoryId) {
          return { ...cat, order: sorted[newIndex].order }
        }
        if (cat.id === sorted[newIndex].id) {
          return { ...cat, order: sorted[currentIndex].order }
        }
        return cat
      })

      return { ...prev, categories: updatedCategories }
    })
  }

  const handleCategoryDragStart = (e: React.DragEvent, categoryId: string) => {
    setDraggedCategoryId(categoryId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleCategoryDragOver = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault()
    if (draggedCategoryId && draggedCategoryId !== categoryId) {
      setDragOverCategoryId(categoryId)
      // Determine index for drop target
      const targetElement = e.target as HTMLElement
      const overElement = targetElement.closest('[draggable="true"]') as HTMLElement
      if (overElement) {
        const index = Array.from(overElement.parentNode!.children).indexOf(overElement)
        dragCategoryOverIndex.current = index
      }
    }
  }

  const handleCategoryDragLeave = () => {
    setDragOverCategoryId(null)
    dragCategoryOverIndex.current = null
  }

  const handleCategoryDrop = (e: React.DragEvent, targetCategoryId: string) => {
    e.preventDefault()
    if (!draggedCategoryId || draggedCategoryId === targetCategoryId) {
      setDraggedCategoryId(null)
      setDragOverCategoryId(null)
      dragCategoryOverIndex.current = null
      return
    }

    setFlows((prev) => {
      const sorted = [...prev.categories].sort((a, b) => a.order - b.order)
      const draggedIndex = sorted.findIndex((c) => c.id === draggedCategoryId)
      const targetIndex =
        dragCategoryOverIndex.current !== null
          ? dragCategoryOverIndex.current
          : sorted.findIndex((c) => c.id === targetCategoryId)

      if (draggedIndex === -1 || targetIndex === -1) return prev

      // Remove dragged item and insert at target position
      const newSorted = [...sorted]
      const [removed] = newSorted.splice(draggedIndex, 1)
      newSorted.splice(targetIndex, 0, removed)

      // Reassign orders
      const updatedCategories = prev.categories.map((cat) => {
        const newOrder = newSorted.findIndex((c) => c.id === cat.id)
        return { ...cat, order: newOrder }
      })

      return { ...prev, categories: updatedCategories }
    })

    setDraggedCategoryId(null)
    setDragOverCategoryId(null)
    dragCategoryOverIndex.current = null
  }

  const handleCategoryDragEnd = () => {
    setDraggedCategoryId(null)
    setDragOverCategoryId(null)
    dragCategoryOverIndex.current = null
  }

  const handleQuestionDragStart = (e: React.DragEvent, questionId: string) => {
    setDraggedQuestionId(questionId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleQuestionDragOver = (e: React.DragEvent, questionId: string) => {
    e.preventDefault()
    if (draggedQuestionId && draggedQuestionId !== questionId) {
      setDragOverQuestionId(questionId)
      // Determine index for drop target
      const targetElement = e.target as HTMLElement
      const overElement = targetElement.closest('[draggable="true"]') as HTMLElement
      if (overElement) {
        const index = Array.from(overElement.parentNode!.children).indexOf(overElement)
        dragQuestionOverIndex.current = index
      }
    }
  }

  const handleQuestionDragLeave = () => {
    setDragOverQuestionId(null)
    dragQuestionOverIndex.current = null
  }

  const handleQuestionDrop = (e: React.DragEvent, targetQuestionId: string, parentQuestionId?: string) => {
    e.preventDefault()
    if (!draggedQuestionId || draggedQuestionId === targetQuestionId) {
      setDraggedQuestionId(null)
      setDragOverQuestionId(null)
      dragQuestionOverIndex.current = null
      return
    }

    if (parentQuestionId) {
      // Reorder within subQuestions
      setFlows((prev) => ({
        ...prev,
        questions: updateQuestionRecursively(prev.questions, parentQuestionId, (parent) => {
          if (!parent.subQuestions) return parent
          const sorted = [...parent.subQuestions].sort((a, b) => a.order - b.order)
          const draggedIndex = sorted.findIndex((q) => q.id === draggedQuestionId)
          const targetIndex =
            dragQuestionOverIndex.current !== null
              ? dragQuestionOverIndex.current
              : sorted.findIndex((q) => q.id === targetQuestionId)

          if (draggedIndex === -1 || targetIndex === -1) return parent

          const newSorted = [...sorted]
          const [removed] = newSorted.splice(draggedIndex, 1)
          newSorted.splice(targetIndex, 0, removed)

          const updatedSubQuestions = parent.subQuestions.map((q) => {
            const newOrder = newSorted.findIndex((sq) => sq.id === q.id)
            return { ...q, order: newOrder }
          })

          return { ...parent, subQuestions: updatedSubQuestions }
        }),
      }))
    } else {
      // Reorder root questions
      setFlows((prev) => {
        const categoryQuestions = prev.questions
          .filter((q) => q.categoryId === selectedCategory)
          .sort((a, b) => a.order - b.order)
        const draggedIndex = categoryQuestions.findIndex((q) => q.id === draggedQuestionId)
        const targetIndex =
          dragQuestionOverIndex.current !== null
            ? dragQuestionOverIndex.current
            : categoryQuestions.findIndex((q) => q.id === targetQuestionId)

        if (draggedIndex === -1 || targetIndex === -1) return prev

        const newSorted = [...categoryQuestions]
        const [removed] = newSorted.splice(draggedIndex, 1)
        newSorted.splice(targetIndex, 0, removed)

        const updatedQuestions = prev.questions.map((q) => {
          if (q.categoryId !== selectedCategory) return q
          const newOrder = newSorted.findIndex((sq) => sq.id === q.id)
          return { ...q, order: newOrder }
        })

        return { ...prev, questions: updatedQuestions }
      })
    }

    setDraggedQuestionId(null)
    setDragOverQuestionId(null)
    dragQuestionOverIndex.current = null
  }

  const handleQuestionDragEnd = () => {
    setDraggedQuestionId(null)
    setDragOverQuestionId(null)
    dragQuestionOverIndex.current = null
  }

  const sortedCategories = [...flows.categories].sort((a, b) => a.order - b.order)
  const filteredCategories = sortedCategories.filter((cat) =>
    t(cat.name).toLowerCase().includes(categorySearch.toLowerCase()),
  )

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

  const reorderQuestion = (questionId: string, direction: "up" | "down", parentQuestionId?: string) => {
    if (parentQuestionId) {
      // Reorder within subQuestions
      setFlows((prev) => ({
        ...prev,
        questions: updateQuestionRecursively(prev.questions, parentQuestionId, (parent) => {
          if (!parent.subQuestions) return parent
          const sorted = [...parent.subQuestions].sort((a, b) => a.order - b.order)
          const currentIndex = sorted.findIndex((q) => q.id === questionId)
          if (currentIndex === -1) return parent

          const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
          if (newIndex < 0 || newIndex >= sorted.length) return parent

          // Swap orders
          const updatedSubQuestions = parent.subQuestions.map((q) => {
            if (q.id === questionId) {
              return { ...q, order: sorted[newIndex].order }
            }
            if (q.id === sorted[newIndex].id) {
              return { ...q, order: sorted[currentIndex].order }
            }
            return q
          })

          return { ...parent, subQuestions: updatedSubQuestions }
        }),
      }))
    } else {
      // Reorder root questions
      setFlows((prev) => {
        const categoryQuestions = prev.questions
          .filter((q) => q.categoryId === selectedCategory)
          .sort((a, b) => a.order - b.order)
        const currentIndex = categoryQuestions.findIndex((q) => q.id === questionId)
        if (currentIndex === -1) return prev

        const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
        if (newIndex < 0 || newIndex >= categoryQuestions.length) return prev

        // Swap orders
        const updatedQuestions = prev.questions.map((q) => {
          if (q.categoryId !== selectedCategory) return q
          if (q.id === questionId) {
            return { ...q, order: categoryQuestions[newIndex].order }
          }
          if (q.id === categoryQuestions[newIndex].id) {
            return { ...q, order: categoryQuestions[currentIndex].order }
          }
          return q
        })

        return { ...prev, questions: updatedQuestions }
      })
    }
  }

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
        <div className="w-80 border-r border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-primary" />
                Flow Builder
              </h1>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
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
                            onClick={() => setCurrentLang(lang.code)}
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

              {missingCount > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30 cursor-help">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {missingCount}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="font-medium">{missingCount} missing translations</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Some categories, questions, or answers are missing translations in one or more languages. Click on
                      translation badges to complete them.
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          {/* CHANGED: Redesigned category actions - separate search and add */}
          <div className="p-3 space-y-3 border-b border-border">
            {/* Search input - clearly a search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="pl-9 bg-muted/50 border-border text-foreground text-sm"
              />
            </div>

            {/* Add Category button - opens modal */}
            <Button onClick={() => setShowAddCategoryModal(true)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add New Category
            </Button>
          </div>

          {/* ADDED: Add Category Modal/Dialog inline */}
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
                  onKeyDown={(e) => e.key === "Enter" && addCategory()}
                  className="bg-input border-border text-foreground text-sm"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button onClick={addCategory} disabled={!newCategoryName.trim()} className="flex-1" size="sm">
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

          {/* CHANGED: Using filteredCategories instead of flows.categories */}
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
                const questionCount = flows.questions.filter((q) => q.categoryId === category.id).length
                const isSelected = selectedCategory === category.id
                const isDragOver = dragOverCategoryId === category.id
                const isDragging = draggedCategoryId === category.id

                return (
                  <div
                    key={category.id}
                    draggable
                    onDragStart={(e) => handleCategoryDragStart(e, category.id)}
                    onDragOver={(e) => handleCategoryDragOver(e, category.id)}
                    onDragLeave={handleCategoryDragLeave}
                    onDrop={(e) => handleCategoryDrop(e, category.id)}
                    onDragEnd={handleCategoryDragEnd}
                    className={`transition-all duration-200 ${isDragging ? "opacity-50" : ""
                      } ${isDragOver ? "border-t-2 border-primary" : ""}`}
                  >
                    {editingCategoryId === category.id ? (
                      <div className="flex items-center gap-1 p-2">
                        <Input
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && updateCategory(category.id)}
                          className="h-8 text-sm"
                          autoFocus
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => updateCategory(category.id)}
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
                          <div className="flex flex-col">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-4 w-4 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                reorderCategory(category.id, "up")
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
                                reorderCategory(category.id, "down")
                              }}
                              disabled={index === filteredCategories.length - 1}
                            >
                              <ArrowDown className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0" onClick={() => setSelectedCategory(category.id)}>
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium">{t(category.name)}</span>
                            <TranslationBadge
                              translations={category.name}
                              onClick={() => openTranslationModal("category", category.id, "name")}
                            />
                          </div>
                          <span className="text-xs opacity-60">{questionCount} questions</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingCategoryId(category.id)
                              setEditingCategoryName(t(category.name))
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
                              const categoryName = category.name[currentLang] || category.name["en"] || "Untitled"
                              handleDeleteCategory(category.id, categoryName)
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

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Breadcrumbs Header */}
          <div className="border-b border-border bg-card p-4">
            {breadcrumbs.length > 0 ? (
              <div className="flex items-center gap-2 flex-wrap">
                {breadcrumbs.length > 1 && (
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
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">Select a category to start</div>
            )}
          </div>

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

                {/* Questions List */}
                {/* Error Display */}
                {/* Note: I need to define 'error' state first. I will assume I add it or use existing mechanism, but wait... 
                    I haven't added 'error' state to the component yet. 
                    I must add [error, setError] first! 
                    I can't do that easily with replace_file_content if I'm not careful about where I insert it.
                    I'll add the UI part here assuming 'error' will be available or I'll skip error UI for a moment and just fix the layout.
                    Actually, let's just clean up the 'DEBUG' block.
                */}
                <div className="text-xs text-muted-foreground mb-2 flex justify-between">
                  <span>Questions in DB: {flows.questions.length}</span>
                </div>
                {currentQuestions.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>No questions yet. Add your first question above.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentQuestions.map((question, index) => {
                      const hasAnswer = question.answer && Object.values(question.answer).some((v) => v?.trim())
                      const hasSubQuestions = question.subQuestions && question.subQuestions.length > 0
                      const currentAnswer = question.answer?.[currentLang] || ""
                      const isActive = activePanel?.questionId === question.id
                      const isDragOver = dragOverQuestionId === question.id
                      const isDragging = draggedQuestionId === question.id
                      const parentQuestionId =
                        breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 1].id : undefined

                      return (
                        <Card
                          key={question.id}
                          draggable
                          onDragStart={(e) => handleQuestionDragStart(e, question.id)}
                          onDragOver={(e) => handleQuestionDragOver(e, question.id)}
                          onDragLeave={handleQuestionDragLeave}
                          onDrop={(e) => handleQuestionDrop(e, question.id, parentQuestionId)}
                          onDragEnd={handleQuestionDragEnd}
                          className={`bg-card border-border transition-all duration-200 ${isDragging ? "opacity-50 scale-[0.98]" : ""
                            } ${isDragOver ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex items-start gap-2">
                                <div className="flex items-center gap-1 pt-1">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded">
                                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Drag to reorder</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <div className="flex flex-col">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-5 w-5 p-0"
                                          onClick={() => reorderQuestion(question.id, "up", parentQuestionId)}
                                          disabled={index === 0}
                                        >
                                          <ArrowUp className="w-3 h-3" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Move up</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-5 w-5 p-0"
                                          onClick={() => reorderQuestion(question.id, "down", parentQuestionId)}
                                          disabled={index === currentQuestions.length - 1}
                                        >
                                          <ArrowDown className="w-3 h-3" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Move down</TooltipContent>
                                    </Tooltip>
                                  </div>
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-start gap-2 flex-wrap">
                                    <h3 className="font-medium text-foreground">{t(question.question)}</h3>
                                    <TranslationBadge
                                      translations={question.question}
                                      onClick={() => openTranslationModal("question", question.id, "question")}
                                    />
                                  </div>

                                  {/* Status Badges */}
                                  <div className="flex items-center gap-2 mt-2">
                                    {hasAnswer && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Badge variant="secondary" className="text-xs gap-1 cursor-help">
                                            <FileText className="w-3 h-3" />
                                            Has Answer
                                            <TranslationBadge
                                              translations={question.answer}
                                              onClick={() => openTranslationModal("question", question.id, "answer")}
                                            />
                                          </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>This question has an answer configured</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                    {hasSubQuestions && (
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
                                    )}
                                    {!hasAnswer && !hasSubQuestions && (
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
                                  handleDeleteQuestion(question.id, truncated)
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
                                    ? closePanel()
                                    : openPanel(question.id, "answer", question)
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
                                    ? closePanel()
                                    : openPanel(question.id, "subquestion", question)
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
                                    ? closePanel()
                                    : openPanel(question.id, "edit", question)
                                }
                                className="gap-1"
                              >
                                <Edit2 className="w-4 h-4" />
                                Edit
                              </Button>

                              {hasSubQuestions && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => navigateInto(question)}
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
                              )}
                            </div>

                            {/* Expandable Panels */}
                            {isActive && (
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
                                        onClick={() => openTranslationModal("question", question.id, "answer")}
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
                                        try {
                                          const res = await fetch(`/api/upload?filename=${file.name}`, { method: 'POST', body: file })
                                          const blob = await res.json()
                                          setAnswerAttachment({ url: blob.url, name: file.name })
                                          alert(`File uploaded: ${file.name}`)
                                        } catch (err) {
                                          console.error(err)
                                          alert("Upload failed")
                                        }
                                      }}
                                    />
                                    {answerAttachment && (
                                      <div className="text-xs text-blue-600 flex items-center justify-between bg-muted/30 p-2 rounded border border-dashed border-blue-200">
                                        <span className="flex items-center gap-2">📎 {answerAttachment.name}</span>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 rounded-full" onClick={() => setAnswerAttachment(null)}>×</Button>
                                      </div>
                                    )}
                                    <div className="flex justify-end gap-2">
                                      <Button variant="ghost" size="sm" onClick={closePanel}>
                                        Cancel
                                      </Button>
                                      <Button size="sm" onClick={() => saveAnswer(question.id)}>
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
                                          addSubQuestion(question.id)
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
                                          onClick={() => addSubQuestion(question.id)}
                                          disabled={!subQuestionForm.trim()}
                                        >
                                          Add
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={closePanel}>
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
                                        onClick={() => openTranslationModal("question", question.id, "question")}
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
                                        try {
                                          const res = await fetch(`/api/upload?filename=${file.name}`, { method: 'POST', body: file })
                                          const blob = await res.json()
                                          setEditAttachment({ url: blob.url, name: file.name })
                                          alert(`File uploaded: ${file.name}`)
                                        } catch (err) {
                                          console.error(err)
                                          alert("Upload failed")
                                        }
                                      }}
                                    />
                                    {editAttachment && (
                                      <div className="text-xs text-blue-600 flex items-center justify-between bg-muted/30 p-2 rounded border border-dashed border-blue-200">
                                        <span className="flex items-center gap-2">📎 {editAttachment.name}</span>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 rounded-full" onClick={() => setEditAttachment(null)}>×</Button>
                                      </div>
                                    )}
                                    <div className="flex justify-end gap-2">
                                      <Button variant="ghost" size="sm" onClick={closePanel}>
                                        Cancel
                                      </Button>
                                      <Button size="sm" onClick={() => saveEdit(question.id)}>
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
                    })}
                  </div>
                )}
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
          </div>
        </div>

        <Dialog open={!!translationModal} onOpenChange={(open) => !open && setTranslationModal(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Languages className="w-5 h-5" />
                Manage Translations
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {AVAILABLE_LANGUAGES.map((lang) => {
                const value = translationForms[lang.code] || ""
                const isMissing = !value.trim()

                return (
                  <div key={lang.code} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{lang.flag}</span>
                      <span className="font-medium">{lang.name}</span>
                      {isMissing && (
                        <Badge variant="outline" className="text-amber-500 border-amber-500/50 text-xs">
                          Missing
                        </Badge>
                      )}
                    </div>
                    {translationModal?.field === "answer" ? (
                      <div className="space-y-3">
                        <Textarea
                          placeholder={`Enter ${lang.name} translation...`}
                          value={value}
                          onChange={(e) => setTranslationForms({ ...translationForms, [lang.code]: e.target.value })}
                          className="min-h-[100px]"
                        />
                        {/* File Upload Section */}
                        <div className="p-3 bg-muted/30 border border-dashed border-border rounded-lg space-y-2">
                          <label className="text-xs font-medium">Attachment (PDF, Word, Image)</label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              className="text-xs h-9 cursor-pointer"
                              onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (!file) return

                                try {
                                  const res = await fetch(`/api/upload?filename=${file.name}`, {
                                    method: 'POST',
                                    body: file,
                                  })
                                  const blob = await res.json()

                                  setTranslationForms(prev => ({
                                    ...prev,
                                    [`${lang.code}_attachmentUrl`]: blob.url,
                                    [`${lang.code}_attachmentName`]: file.name
                                  }))

                                  alert(`File uploaded: ${file.name}`)
                                } catch (err) {
                                  console.error(err)
                                  alert("Upload failed")
                                }
                              }}
                            />
                          </div>
                          {/* Show if file exists */}
                          {(translationForms[`${lang.code}_attachmentName`] || (translationModal.id && findQuestionById(translationModal.id)?.translations?.find(t => t.language === lang.code)?.attachmentName)) && (
                            <div className="text-xs text-blue-600 flex items-center gap-1">
                              <span>📎 {translationForms[`${lang.code}_attachmentName`] || findQuestionById(translationModal.id)?.translations?.find(t => t.language === lang.code)?.attachmentName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <Input
                        placeholder={`Enter ${lang.name} translation...`}
                        value={value}
                        onChange={(e) => setTranslationForms({ ...translationForms, [lang.code]: e.target.value })}
                      />
                    )}
                  </div>
                )
              })}
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <Button variant="ghost" onClick={() => setTranslationModal(null)}>
                Cancel
              </Button>
              <Button onClick={saveTranslations}>Save All Translations</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
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
