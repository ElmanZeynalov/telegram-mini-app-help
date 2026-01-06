"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react"

interface Condition {
  id: string
  type: "contains" | "equals" | "startsWith" | "endsWith"
  value: string
  targetQuestionId: string
}

interface FollowUp {
  id: string
  questionId: string
  conditions: Condition[]
  createdAt: string
}

interface FollowUpsBuilderProps {
  flows: any
  setFlows: (flows: any) => void
}

const CONDITION_TYPES = [
  { value: "contains", label: "Contains" },
  { value: "equals", label: "Equals" },
  { value: "startsWith", label: "Starts with" },
  { value: "endsWith", label: "Ends with" },
]

export function FollowUpsBuilder({ flows, setFlows }: FollowUpsBuilderProps) {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>("")
  const [expandedFollowUpId, setExpandedFollowUpId] = useState<string | null>(null)
  const [editingConditionId, setEditingConditionId] = useState<string | null>(null)
  const [newConditionType, setNewConditionType] = useState<"contains" | "equals" | "startsWith" | "endsWith">(
    "contains",
  )
  const [newConditionValue, setNewConditionValue] = useState("")
  const [newTargetQuestionId, setNewTargetQuestionId] = useState("")

  const sourceQuestion = flows.questions?.find((q: any) => q.id === selectedQuestionId)
  const followUps = flows.followUps || []
  const questionFollowUps = followUps.filter((fu: FollowUp) => fu.questionId === selectedQuestionId)

  const addFollowUp = () => {
    if (!selectedQuestionId) return

    const followUp: FollowUp = {
      id: Date.now().toString(),
      questionId: selectedQuestionId,
      conditions: [],
      createdAt: new Date().toISOString(),
    }

    setFlows({
      ...flows,
      followUps: [...followUps, followUp],
    })
    setExpandedFollowUpId(followUp.id)
  }

  const addCondition = (followUpId: string) => {
    if (!newConditionValue.trim() || !newTargetQuestionId) return

    setFlows({
      ...flows,
      followUps: followUps.map((fu: FollowUp) => {
        if (fu.id === followUpId) {
          return {
            ...fu,
            conditions: [
              ...fu.conditions,
              {
                id: Date.now().toString(),
                type: newConditionType,
                value: newConditionValue,
                targetQuestionId: newTargetQuestionId,
              },
            ],
          }
        }
        return fu
      }),
    })

    setNewConditionValue("")
    setNewTargetQuestionId("")
    setNewConditionType("contains")
  }

  const deleteFollowUp = (followUpId: string) => {
    setFlows({
      ...flows,
      followUps: followUps.filter((fu: FollowUp) => fu.id !== followUpId),
    })
  }

  const deleteCondition = (followUpId: string, conditionId: string) => {
    setFlows({
      ...flows,
      followUps: followUps.map((fu: FollowUp) => {
        if (fu.id === followUpId) {
          return {
            ...fu,
            conditions: fu.conditions.filter((c) => c.id !== conditionId),
          }
        }
        return fu
      }),
    })
  }

  const getQuestionText = (questionId: string) => {
    return flows.questions?.find((q: any) => q.id === questionId)?.question || "Unknown Question"
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {flows.questions?.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Please create questions first before setting up follow-ups.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Select Source Question</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={selectedQuestionId}
                onChange={(e) => {
                  setSelectedQuestionId(e.target.value)
                  setExpandedFollowUpId(null)
                }}
                className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground"
              >
                <option value="">Choose a question...</option>
                {flows.questions?.map((q: any) => (
                  <option key={q.id} value={q.id}>
                    {q.question}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {selectedQuestionId && sourceQuestion && (
            <>
              <Card className="bg-card border-border border-primary/30 bg-primary/5">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">Source Question:</p>
                  <p className="font-medium text-foreground">{sourceQuestion.question}</p>
                </CardContent>
              </Card>

              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-foreground">Conditional Follow-ups</h2>
                <Button onClick={addFollowUp} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Follow-up Branch
                </Button>
              </div>

              {questionFollowUps.length === 0 ? (
                <Card className="bg-card border-border">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">
                      No follow-ups set up yet. Add one to create conditional branches.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {questionFollowUps.map((followUp: FollowUp, idx: number) => {
                    const isExpanded = expandedFollowUpId === followUp.id

                    return (
                      <Card key={followUp.id} className="bg-card border-border">
                        <div
                          className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/20 transition"
                          onClick={() => setExpandedFollowUpId(isExpanded ? null : followUp.id)}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <span className="bg-primary/20 text-primary text-xs font-semibold px-2 py-1 rounded">
                              Branch {idx + 1}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {followUp.conditions.length} condition{followUp.conditions.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteFollowUp(followUp.id)
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="border-t border-border p-4 space-y-4 bg-muted/5">
                            {followUp.conditions.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-foreground">Conditions</h4>
                                {followUp.conditions.map((condition) => (
                                  <div
                                    key={condition.id}
                                    className="bg-card border border-border rounded-md p-3 flex items-center justify-between"
                                  >
                                    <div className="flex items-center gap-2 text-sm flex-1">
                                      <span className="bg-accent/20 text-accent px-2 py-0.5 rounded text-xs font-medium">
                                        {condition.type}
                                      </span>
                                      <span className="text-foreground">"{condition.value}"</span>
                                      <span className="text-muted-foreground">→</span>
                                      <span className="text-primary font-medium">
                                        {getQuestionText(condition.targetQuestionId)}
                                      </span>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => deleteCondition(followUp.id, condition.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="border-t border-border pt-4">
                              <h4 className="text-sm font-semibold text-foreground mb-3">Add Condition</h4>
                              <div className="space-y-3">
                                <div>
                                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                                    Condition Type
                                  </label>
                                  <select
                                    value={newConditionType}
                                    onChange={(e) => setNewConditionType(e.target.value as typeof newConditionType)}
                                    className="w-full px-2 py-1.5 bg-input border border-border rounded text-sm text-foreground"
                                  >
                                    {CONDITION_TYPES.map((type) => (
                                      <option key={type.value} value={type.value}>
                                        {type.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                                    Match Value
                                  </label>
                                  <Input
                                    placeholder="e.g., yes, urgent, help"
                                    value={newConditionValue}
                                    onChange={(e) => setNewConditionValue(e.target.value)}
                                    className="bg-input border-border text-foreground text-sm"
                                  />
                                </div>

                                <div>
                                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                                    Next Question
                                  </label>
                                  <select
                                    value={newTargetQuestionId}
                                    onChange={(e) => setNewTargetQuestionId(e.target.value)}
                                    className="w-full px-2 py-1.5 bg-input border border-border rounded text-sm text-foreground"
                                  >
                                    <option value="">Select a question...</option>
                                    {flows.questions
                                      ?.filter((q: any) => q.id !== selectedQuestionId)
                                      .map((q: any) => (
                                        <option key={q.id} value={q.id}>
                                          {q.question}
                                        </option>
                                      ))}
                                  </select>
                                </div>

                                <Button onClick={() => addCondition(followUp.id)} size="sm" className="w-full gap-2">
                                  <Plus className="w-4 h-4" />
                                  Add Condition
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </Card>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
