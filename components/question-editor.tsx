"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Edit2 } from "lucide-react"

interface Question {
  id: string
  categoryId: string
  question: string
  answer: string
  keywords?: string[]
  createdAt: string
}

interface QuestionEditorProps {
  flows: any
  setFlows: (flows: any) => void
}

export function QuestionEditor({ flows, setFlows }: QuestionEditorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [newQuestion, setNewQuestion] = useState("")
  const [newAnswer, setNewAnswer] = useState("")
  const [newKeywords, setNewKeywords] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editQuestion, setEditQuestion] = useState("")
  const [editAnswer, setEditAnswer] = useState("")
  const [editKeywords, setEditKeywords] = useState("")

  const RichTextEditor = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter the answer (supports HTML, markdown, or plain text)..."
      className="w-full h-32 px-3 py-2 bg-input border border-border rounded-md text-foreground font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
    />
  )

  const addQuestion = () => {
    if (!newQuestion.trim() || !newAnswer.trim() || !selectedCategory) return

    const question: Question = {
      id: Date.now().toString(),
      categoryId: selectedCategory,
      question: newQuestion,
      answer: newAnswer,
      keywords: newKeywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k),
      createdAt: new Date().toISOString(),
    }

    setFlows({
      ...flows,
      questions: [...(flows.questions || []), question],
    })
    resetForm()
  }

  const resetForm = () => {
    setNewQuestion("")
    setNewAnswer("")
    setNewKeywords("")
  }

  const startEditQuestion = (question: Question) => {
    setEditingId(question.id)
    setEditQuestion(question.question)
    setEditAnswer(question.answer)
    setEditKeywords(question.keywords?.join(", ") || "")
  }

  const updateQuestion = () => {
    if (!editQuestion.trim() || !editAnswer.trim()) return

    setFlows({
      ...flows,
      questions: flows.questions.map((q: Question) =>
        q.id === editingId
          ? {
              ...q,
              question: editQuestion,
              answer: editAnswer,
              keywords: editKeywords
                .split(",")
                .map((k) => k.trim())
                .filter((k) => k),
            }
          : q,
      ),
    })
    setEditingId(null)
  }

  const deleteQuestion = (id: string) => {
    setFlows({
      ...flows,
      questions: flows.questions.filter((q: Question) => q.id !== id),
    })
  }

  const categoryQuestions = flows.questions?.filter((q: Question) => q.categoryId === selectedCategory) || []

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {flows.categories?.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Please create categories first before adding questions.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Select Category</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground"
              >
                <option value="">Choose a category...</option>
                {flows.categories?.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {selectedCategory && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Add Question</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Question</label>
                  <Input
                    placeholder="Enter the question..."
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    className="bg-input border-border text-foreground"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Answer</label>
                  <RichTextEditor value={newAnswer} onChange={setNewAnswer} />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Keywords (comma-separated, optional)
                  </label>
                  <Input
                    placeholder="e.g., help, support, urgent"
                    value={newKeywords}
                    onChange={(e) => setNewKeywords(e.target.value)}
                    className="bg-input border-border text-foreground"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={addQuestion} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Question
                  </Button>
                  <Button onClick={resetForm} variant="outline">
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {categoryQuestions.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Questions in this category</h2>
              {categoryQuestions.map((question: Question) => (
                <Card key={question.id} className="bg-card border-border">
                  <CardContent className="p-4">
                    {editingId === question.id ? (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-foreground block mb-2">Question</label>
                          <Input
                            value={editQuestion}
                            onChange={(e) => setEditQuestion(e.target.value)}
                            className="bg-input border-border text-foreground"
                            autoFocus
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-foreground block mb-2">Answer</label>
                          <RichTextEditor value={editAnswer} onChange={setEditAnswer} />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-foreground block mb-2">Keywords</label>
                          <Input
                            value={editKeywords}
                            onChange={(e) => setEditKeywords(e.target.value)}
                            className="bg-input border-border text-foreground"
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={updateQuestion} size="sm">
                            Save
                          </Button>
                          <Button onClick={() => setEditingId(null)} size="sm" variant="outline">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-medium text-foreground">{question.question}</h3>
                            {question.keywords && question.keywords.length > 0 && (
                              <div className="flex gap-2 mt-2 flex-wrap">
                                {question.keywords.map((keyword, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-block bg-primary/20 text-primary text-xs px-2 py-1 rounded"
                                  >
                                    {keyword}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => startEditQuestion(question)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteQuestion(question.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground whitespace-pre-wrap">{question.answer}</div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
