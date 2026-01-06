"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, RotateCcw } from "lucide-react"

interface Message {
  id: string
  type: "bot" | "user"
  content: string
  timestamp: Date
}

interface FlowPreviewProps {
  flows: any
}

export function FlowPreview({ flows }: FlowPreviewProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [userInput, setUserInput] = useState("")
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getQuestionById = (id: string) => {
    return flows.questions?.find((q: any) => q.id === id)
  }

  const startFlow = () => {
    if (flows.categories?.length === 0) {
      addBotMessage("Please create categories and questions first before testing the flow.")
      return
    }

    const firstQuestion = flows.questions?.[0]
    if (!firstQuestion) {
      addBotMessage("Please create questions first before testing the flow.")
      return
    }

    setMessages([])
    setCurrentQuestionId(firstQuestion.id)
    addBotMessage(firstQuestion.question)
  }

  const addBotMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      type: "bot",
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, message])
  }

  const addUserMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, message])
  }

  const processUserResponse = async (response: string) => {
    addUserMessage(response)
    setIsLoading(true)

    // Simulate bot processing delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (!currentQuestionId) {
      addBotMessage("Flow ended. Type 'restart' or click the reset button to start over.")
      setIsLoading(false)
      return
    }

    // Get the current question
    const currentQuestion = getQuestionById(currentQuestionId)
    if (!currentQuestion) {
      addBotMessage("Error: Question not found.")
      setIsLoading(false)
      return
    }

    // Send the answer
    const answerText = currentQuestion.answer.replace(/<[^>]*>/g, "")
    addBotMessage(answerText)

    // Check for follow-ups with conditions
    const followUp = flows.followUps?.find((fu: any) => fu.questionId === currentQuestionId)

    if (followUp && followUp.conditions.length > 0) {
      let nextQuestionId: string | null = null

      // Check each condition
      for (const condition of followUp.conditions) {
        const matches = checkCondition(response, condition.type, condition.value)
        if (matches) {
          nextQuestionId = condition.targetQuestionId
          break
        }
      }

      if (nextQuestionId) {
        const nextQuestion = getQuestionById(nextQuestionId)
        if (nextQuestion) {
          setCurrentQuestionId(nextQuestionId)
          await new Promise((resolve) => setTimeout(resolve, 300))
          addBotMessage(nextQuestion.question)
        }
      } else {
        addBotMessage("No follow-up conditions matched. Flow ended.")
        setCurrentQuestionId(null)
      }
    } else {
      // Move to next question in sequence if no follow-ups
      const currentIndex = flows.questions?.findIndex((q: any) => q.id === currentQuestionId)
      if (currentIndex !== -1 && currentIndex < flows.questions?.length - 1) {
        const nextQuestion = flows.questions?.[currentIndex + 1]
        if (nextQuestion) {
          setCurrentQuestionId(nextQuestion.id)
          await new Promise((resolve) => setTimeout(resolve, 300))
          addBotMessage(nextQuestion.question)
        }
      } else {
        addBotMessage("You've reached the end of the conversation flow. Type 'restart' to begin again.")
        setCurrentQuestionId(null)
      }
    }

    setIsLoading(false)
  }

  const checkCondition = (input: string, type: string, value: string): boolean => {
    const lowerInput = input.toLowerCase()
    const lowerValue = value.toLowerCase()

    switch (type) {
      case "contains":
        return lowerInput.includes(lowerValue)
      case "equals":
        return lowerInput === lowerValue
      case "startsWith":
        return lowerInput.startsWith(lowerValue)
      case "endsWith":
        return lowerInput.endsWith(lowerValue)
      default:
        return false
    }
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userInput.trim()) return

    if (userInput.toLowerCase() === "restart") {
      startFlow()
      setUserInput("")
      return
    }

    if (currentQuestionId === null && !messages.length) {
      startFlow()
      setUserInput("")
      return
    }

    processUserResponse(userInput)
    setUserInput("")
  }

  const hasData = flows.questions?.length > 0 && flows.categories?.length > 0

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <Card className="bg-card border-border flex-1 flex flex-col">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-foreground flex items-center justify-between">
            <span>Flow Conversation Tester</span>
            <Button onClick={startFlow} size="sm" variant="outline" className="gap-2 bg-transparent">
              <RotateCcw className="w-4 h-4" />
              Start Flow
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {!hasData && messages.length === 0 && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  {flows.categories?.length === 0
                    ? "Create categories first to test your flow"
                    : "Create questions to test your flow"}
                </p>
              </div>
            </div>
          )}

          {messages.length === 0 && hasData && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">Click "Start Flow" to begin testing your conversation</p>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === "bot" ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === "bot"
                    ? "bg-muted/50 text-foreground rounded-bl-none"
                    : "bg-primary text-primary-foreground rounded-br-none"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${message.type === "bot" ? "text-muted-foreground" : "text-primary-foreground/70"}`}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted/50 text-foreground px-4 py-2 rounded-lg rounded-bl-none">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        <div className="border-t border-border p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              placeholder={
                currentQuestionId === null && messages.length === 0
                  ? "Type 'start' or click the button above..."
                  : "Type your response..."
              }
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={isLoading}
              className="bg-input border-border text-foreground"
            />
            <Button type="submit" disabled={isLoading || !userInput.trim()} className="flex-shrink-0 gap-2">
              <Send className="w-4 h-4" />
              Send
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2">Type 'restart' to reset the conversation</p>
        </div>
      </Card>

      {/* Flow Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Categories</p>
            <p className="text-2xl font-bold text-primary mt-1">{flows.categories?.length || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Questions</p>
            <p className="text-2xl font-bold text-primary mt-1">{flows.questions?.length || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Follow-up Branches</p>
            <p className="text-2xl font-bold text-primary mt-1">{flows.followUps?.length || 0}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
