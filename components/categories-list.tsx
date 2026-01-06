"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Edit2 } from "lucide-react"

interface CategoriesListProps {
  flows: any
  setFlows: (flows: any) => void
}

export function CategoriesList({ flows, setFlows }: CategoriesListProps) {
  const [newCategory, setNewCategory] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

  const addCategory = () => {
    if (!newCategory.trim()) return

    const category = {
      id: Date.now().toString(),
      name: newCategory,
      createdAt: new Date().toISOString(),
    }

    setFlows({
      ...flows,
      categories: [...(flows.categories || []), category],
    })
    setNewCategory("")
  }

  const deleteCategory = (id: string) => {
    setFlows({
      ...flows,
      categories: flows.categories.filter((cat: any) => cat.id !== id),
    })
  }

  const updateCategory = (id: string, newName: string) => {
    setFlows({
      ...flows,
      categories: flows.categories.map((cat: any) => (cat.id === id ? { ...cat, name: newName } : cat)),
    })
    setEditingId(null)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Add New Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter category name..."
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addCategory()}
              className="bg-input border-border text-foreground"
            />
            <Button onClick={addCategory} className="gap-2">
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {flows.categories?.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No categories yet. Create your first one above!</p>
        ) : (
          flows.categories?.map((category: any) => (
            <Card key={category.id} className="bg-card border-border">
              <CardContent className="p-4 flex items-center justify-between">
                {editingId === category.id ? (
                  <div className="flex gap-2 flex-1">
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="bg-input border-border text-foreground flex-1"
                      autoFocus
                    />
                    <Button size="sm" onClick={() => updateCategory(category.id, editValue)}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <h3 className="font-medium text-foreground">{category.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(category.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(category.id)
                          setEditValue(category.name)
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteCategory(category.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
