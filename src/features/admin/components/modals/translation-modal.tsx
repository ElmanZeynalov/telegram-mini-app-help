import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Languages } from "lucide-react"
import RichTextEditor from "@/components/rich-text-editor"
import { AVAILABLE_LANGUAGES, TranslatedString } from "../../types"

interface TranslationModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: () => void
    type: "category" | "question"
    field: "name" | "question" | "answer"
    id: string
    translationForms: TranslatedString
    setTranslationForms: (forms: TranslatedString) => void
    handleFileUpload: (file: File) => Promise<{ url: string; name: string } | null>
    // Helper to find existing attachments if needed. 
    // For simplicity, we can pass a map or function to check attachments status from parent if needed, 
    // OR we can make the parent flatten the data before passing.
    // The original code used `findQuestionById(translationModal.id)`. 
    // To avoid prop drilling `findQuestionById`, let's pass a `getAttachment` prop.
    getAttachment: (langCode: string) => { url: string; name: string } | null
}

export function TranslationModal({
    isOpen,
    onClose,
    onSave,
    type,
    field,
    id,
    translationForms,
    setTranslationForms,
    handleFileUpload,
    getAttachment
}: TranslationModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Languages className="w-5 h-5" />
                        Manage Translations
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    {AVAILABLE_LANGUAGES.map((lang) => {
                        // Note: translationForms might contain mix of text and attachments keys
                        // The logic in original code relies on keys like `${lang.code}_attachmentUrl` in the same object.
                        // We'll keep that behavior.
                        const value = translationForms[lang.code] || ""
                        const isMissing = !value.trim()

                        const attachmentNameKey = `${lang.code}_attachmentName`
                        const existingAttachment = getAttachment(lang.code)
                        const currentAttachmentName = translationForms[attachmentNameKey] || existingAttachment?.name

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
                                {field === "answer" ? (
                                    <div className="space-y-3">
                                        <RichTextEditor
                                            value={value}
                                            onChange={(val) => setTranslationForms({ ...translationForms, [lang.code]: val })}
                                            placeholder={`Enter ${lang.name} translation...`}
                                            onFileSelect={async (file) => {
                                                if (!file) return
                                                const result = await handleFileUpload(file)
                                                if (result) {
                                                    setTranslationForms({
                                                        ...translationForms,
                                                        [`${lang.code}_attachmentUrl`]: result.url,
                                                        [`${lang.code}_attachmentName`]: result.name
                                                    })
                                                    // Note: Original code used functional update: prev => ... 
                                                    // Here `setTranslationForms` just calls parent `setState` usually?
                                                    // Ideally parent passes a wrapper or we assume `translationForms` prop is fresh.
                                                    // If `setTranslationForms` is just `setState`, we can only do this if `translationForms` is current.
                                                }
                                            }}
                                        />
                                        {/* Show if file exists */}
                                        {currentAttachmentName && (
                                            <div className="mt-1 text-xs text-blue-600 flex items-center justify-between bg-muted/30 p-2 rounded border border-dashed border-blue-200">
                                                <span className="flex items-center gap-2">
                                                    📎 {currentAttachmentName}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 rounded-full"
                                                    onClick={() => {
                                                        setTranslationForms({
                                                            ...translationForms,
                                                            [`${lang.code}_attachmentUrl`]: "", // Mark for deletion
                                                            [`${lang.code}_attachmentName`]: ""
                                                        })
                                                    }}
                                                >
                                                    ×
                                                </Button>
                                            </div>
                                        )}
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
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={onSave}>Save All Translations</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
