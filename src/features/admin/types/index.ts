export const AVAILABLE_LANGUAGES = [
    { code: "az", name: "Azərbaycan", flag: "🇦🇿" },
    { code: "ru", name: "Русский", flag: "🇷🇺" },
]

export type TranslatedString = { [langCode: string]: string }

export interface Category {
    id: string
    name: TranslatedString
    order: number
    createdAt: string
}

export interface Question {
    id: string
    categoryId?: string
    question: TranslatedString
    answer?: TranslatedString
    attachments?: Record<string, { url: string; name: string } | null>
    keywords?: string[]
    subQuestions?: Question[]
    translations?: any[]
    order: number
    createdAt: string
}

export interface Breadcrumb {
    id: string
    label: string
    type: "category" | "question"
}

export type ActivePanel = {
    questionId: string
    panel: "answer" | "subquestion" | "edit" | null
}
