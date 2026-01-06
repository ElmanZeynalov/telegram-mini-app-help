"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Check, Eye, EyeOff, Save, AlertCircle, CheckCircle } from "lucide-react"

interface BotConfig {
  botName: string
  botToken: string
  webhookUrl: string
  webhookSecret: string
  isActive: boolean
  createdAt: string
  lastUpdated: string
}

interface BotSettingsProps {
  flows: any
}

const DEFAULT_CONFIG: BotConfig = {
  botName: "",
  botToken: "",
  webhookUrl: "",
  webhookSecret: "",
  isActive: false,
  createdAt: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
}

export function BotSettings({ flows }: BotSettingsProps) {
  const [config, setConfig] = useState<BotConfig>(DEFAULT_CONFIG)
  const [isEditing, setIsEditing] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle")
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [formData, setFormData] = useState<BotConfig>(DEFAULT_CONFIG)

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem("botConfig")
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig)
        setConfig(parsedConfig)
        setFormData(parsedConfig)
      } catch (e) {
        console.error("Failed to load bot config:", e)
      }
    }
  }, [])

  const handleInputChange = (field: keyof BotConfig, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaveConfig = () => {
    if (!formData.botName.trim() || !formData.botToken.trim()) {
      setSaveStatus("error")
      setTimeout(() => setSaveStatus("idle"), 3000)
      return
    }

    setSaveStatus("saving")

    setTimeout(() => {
      const updatedConfig = {
        ...formData,
        lastUpdated: new Date().toISOString(),
      }
      localStorage.setItem("botConfig", JSON.stringify(updatedConfig))
      setConfig(updatedConfig)
      setSaveStatus("success")
      setIsEditing(false)
      setTimeout(() => setSaveStatus("idle"), 3000)
    }, 500)
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const generateWebhookSecret = () => {
    const secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    setFormData((prev) => ({
      ...prev,
      webhookSecret: secret,
    }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Status Messages */}
      {saveStatus === "success" && (
        <div className="bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-md text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Bot configuration saved successfully!
        </div>
      )}
      {saveStatus === "error" && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-md text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Please fill in all required fields
        </div>
      )}

      {/* Bot Status Card */}
      <Card className={`bg-card border-border ${config.isActive ? "border-green-500/30" : ""}`}>
        <CardHeader>
          <CardTitle className="text-foreground flex items-center justify-between">
            <span>Bot Status</span>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${config.isActive ? "bg-green-500" : "bg-gray-500"}`}></div>
              <span className="text-sm font-normal text-muted-foreground">
                {config.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {config.botName && (
              <div>
                <p className="text-sm text-muted-foreground">Bot Name</p>
                <p className="text-foreground font-medium">{config.botName}</p>
              </div>
            )}
            {config.lastUpdated && (
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-foreground text-sm">{new Date(config.lastUpdated).toLocaleString()}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bot Configuration */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center justify-between">
            <span>Telegram Bot Configuration</span>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} size="sm" className="gap-2">
                Edit
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            <>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Bot Name <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="e.g., Support Assistant Bot"
                  value={formData.botName}
                  onChange={(e) => handleInputChange("botName", e.target.value)}
                  className="bg-input border-border text-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">A friendly name for your bot</p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Bot Token <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showToken ? "text" : "password"}
                    placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                    value={formData.botToken}
                    onChange={(e) => handleInputChange("botToken", e.target.value)}
                    className="bg-input border-border text-foreground pr-10"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowToken(!showToken)}
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Get this from <span className="font-mono">@BotFather</span> on Telegram
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Webhook URL</label>
                <Input
                  placeholder="https://yourdomain.com/api/telegram/webhook"
                  value={formData.webhookUrl}
                  onChange={(e) => handleInputChange("webhookUrl", e.target.value)}
                  className="bg-input border-border text-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your server endpoint that will receive Telegram updates
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Webhook Secret</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showSecret ? "text" : "password"}
                      placeholder="Your webhook secret key"
                      value={formData.webhookSecret}
                      onChange={(e) => handleInputChange("webhookSecret", e.target.value)}
                      className="bg-input border-border text-foreground pr-10"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowSecret(!showSecret)}
                    >
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  <Button onClick={generateWebhookSecret} variant="outline" className="flex-shrink-0 bg-transparent">
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Used to validate webhook requests from Telegram</p>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveConfig} disabled={saveStatus === "saving"} className="gap-2">
                  <Save className="w-4 h-4" />
                  {saveStatus === "saving" ? "Saving..." : "Save Configuration"}
                </Button>
                <Button onClick={() => setIsEditing(false)} variant="outline" className="bg-transparent">
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              {config.botName ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-1">Bot Name</label>
                    <p className="text-foreground font-medium">{config.botName}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-2">Bot Token</label>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted/50 text-foreground px-3 py-2 rounded text-sm flex-1 truncate">
                        {config.botToken.substring(0, 10)}...
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(config.botToken, "botToken")}
                        className="bg-transparent"
                      >
                        {copiedField === "botToken" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {config.webhookUrl && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground block mb-2">Webhook URL</label>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted/50 text-foreground px-3 py-2 rounded text-sm flex-1 truncate">
                          {config.webhookUrl}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(config.webhookUrl, "webhookUrl")}
                          className="bg-transparent"
                        >
                          {copiedField === "webhookUrl" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No bot configuration yet. Click Edit to add your Telegram bot details.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Flow Integration Info */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Flow Statistics</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted/50 rounded-md p-4">
            <p className="text-xs text-muted-foreground">Total Categories</p>
            <p className="text-2xl font-bold text-primary mt-1">{flows.categories?.length || 0}</p>
          </div>
          <div className="bg-muted/50 rounded-md p-4">
            <p className="text-xs text-muted-foreground">Total Questions</p>
            <p className="text-2xl font-bold text-primary mt-1">{flows.questions?.length || 0}</p>
          </div>
          <div className="bg-muted/50 rounded-md p-4">
            <p className="text-xs text-muted-foreground">Conditional Paths</p>
            <p className="text-2xl font-bold text-primary mt-1">{flows.followUps?.length || 0}</p>
          </div>
        </CardContent>
      </Card>

      {/* Deployment Guide */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground text-sm">Deployment Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">1. Get Your Bot Token</h4>
            <p className="text-sm text-muted-foreground">
              Message <span className="font-mono bg-muted/50 px-1 rounded">@BotFather</span> on Telegram and create a
              new bot to get your token.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-foreground">2. Set Up Webhook</h4>
            <p className="text-sm text-muted-foreground">
              Configure your server endpoint that will receive updates from Telegram. Make sure it's publicly
              accessible.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-foreground">3. Deploy Your Flow</h4>
            <p className="text-sm text-muted-foreground">
              Export your flow configuration and integrate it with your backend server to process Telegram messages
              through your conversation flow.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-foreground">4. Register Webhook with Telegram</h4>
            <p className="text-sm text-muted-foreground">
              Use the Telegram Bot API to register your webhook URL: <br />
              <code className="bg-muted/50 text-foreground px-2 py-1 rounded text-xs block mt-1">
                POST /setWebhook?url={"{webhookUrl}"}&secret_token={"{webhookSecret}"}
              </code>
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-3">
            <p className="text-xs text-blue-400">
              Tip: Keep your bot token and webhook secret secure. Never commit them to version control.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
