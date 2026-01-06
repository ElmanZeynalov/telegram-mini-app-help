"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Upload, Copy, Check } from "lucide-react"

interface ExportImportProps {
  flows: any
  setFlows: (flows: any) => void
}

export function ExportImport({ flows, setFlows }: ExportImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [exportFormat, setExportFormat] = useState<"json" | "yaml">("json")
  const [importSuccess, setImportSuccess] = useState(false)
  const [importError, setImportError] = useState("")
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)

  const exportToJSON = () => {
    const dataStr = JSON.stringify(flows, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `flow-export-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportAsText = () => {
    const dataStr = JSON.stringify(flows, null, 2)
    navigator.clipboard.writeText(dataStr)
    setCopiedToClipboard(true)
    setTimeout(() => setCopiedToClipboard(false), 2000)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const importedData = JSON.parse(content)

        if (!importedData.categories || !importedData.questions || !importedData.followUps) {
          throw new Error("Invalid flow file format. Missing required fields.")
        }

        setFlows(importedData)
        setImportSuccess(true)
        setImportError("")
        setTimeout(() => setImportSuccess(false), 3000)
      } catch (error) {
        setImportError(error instanceof Error ? error.message : "Failed to import file")
        setImportSuccess(false)
      }
    }
    reader.readAsText(file)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleImportFromText = () => {
    const text = prompt("Paste your flow JSON here:")
    if (!text) return

    try {
      const importedData = JSON.parse(text)

      if (!importedData.categories || !importedData.questions || !importedData.followUps) {
        throw new Error("Invalid flow format. Missing required fields.")
      }

      setFlows(importedData)
      setImportSuccess(true)
      setImportError("")
      setTimeout(() => setImportSuccess(false), 3000)
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Failed to parse JSON")
      setImportSuccess(false)
    }
  }

  const resetAllData = () => {
    if (window.confirm("Are you sure you want to reset all data? This cannot be undone.")) {
      setFlows({
        categories: [],
        questions: [],
        followUps: [],
      })
    }
  }

  const getTotalStats = () => {
    return {
      categories: flows.categories?.length || 0,
      questions: flows.questions?.length || 0,
      followUps: flows.followUps?.length || 0,
    }
  }

  const stats = getTotalStats()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Status Messages */}
      {importSuccess && (
        <div className="bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-md text-sm">
          Flow imported successfully!
        </div>
      )}
      {importError && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-md text-sm">
          {importError}
        </div>
      )}

      {/* Export Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Your Flow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 border border-border rounded-md p-4 space-y-2">
            <p className="text-sm font-medium text-foreground">Current Flow Statistics:</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold text-primary">{stats.categories}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Questions</p>
                <p className="text-2xl font-bold text-primary">{stats.questions}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Follow-ups</p>
                <p className="text-2xl font-bold text-primary">{stats.followUps}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Download your flow as a JSON file to backup or share:</p>
            <Button onClick={exportToJSON} className="w-full gap-2">
              <Download className="w-4 h-4" />
              Download as JSON File
            </Button>
          </div>

          <div className="border-t border-border pt-4 space-y-2">
            <p className="text-sm text-muted-foreground">Copy your flow data as text to clipboard:</p>
            <Button onClick={exportAsText} variant="outline" className="w-full gap-2 bg-transparent">
              {copiedToClipboard ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy as Text
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import a Flow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Restore your flow from a previously exported file or share flows with team members.
          </p>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground block">Upload JSON File</label>
            <div className="flex gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="bg-input border-border text-foreground"
              />
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="flex-shrink-0 gap-2">
                <Upload className="w-4 h-4" />
                Choose File
              </Button>
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-2">
            <Button onClick={handleImportFromText} variant="outline" className="w-full bg-transparent">
              Import from Text
            </Button>
            <p className="text-xs text-muted-foreground">Paste your JSON directly instead of uploading a file</p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-card border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Reset all data. This will permanently delete all categories, questions, and follow-ups.
          </p>
          <Button onClick={resetAllData} variant="destructive" className="w-full">
            Reset All Data
          </Button>
        </CardContent>
      </Card>

      {/* Format Guide */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground text-sm">Flow Format Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-md p-4 overflow-x-auto">
            <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap break-words">
              {`{
  "categories": [
    {"id": "1", "name": "Billing", "createdAt": "..."}
  ],
  "questions": [
    {
      "id": "1",
      "categoryId": "1",
      "question": "How do I reset my password?",
      "answer": "<p>Click forgot password...</p>",
      "keywords": ["password", "reset"],
      "createdAt": "..."
    }
  ],
  "followUps": [
    {
      "id": "1",
      "questionId": "1",
      "conditions": [
        {
          "id": "1",
          "type": "contains",
          "value": "urgent",
          "targetQuestionId": "2"
        }
      ],
      "createdAt": "..."
    }
  ]
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
