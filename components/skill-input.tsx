"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Plus, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SkillInputProps {
  label: string
  skills: string[]
  onSkillsChange: (skills: string[]) => void
  placeholder: string
  suggestions: string[]
  colorClass: string
}

export function SkillInput({ label, skills, onSkillsChange, placeholder, suggestions, colorClass }: SkillInputProps) {
  const [newSkill, setNewSkill] = useState("")
  const { toast } = useToast()

  const addSkill = () => {
    const trimmedSkill = newSkill.trim()
    if (!trimmedSkill) return

    // Check for case-insensitive duplicates
    const skillExists = skills.some((skill) => skill.toLowerCase() === trimmedSkill.toLowerCase())

    if (skillExists) {
      toast({
        title: "Skill already exists",
        description: "This skill is already in your list (case-insensitive match).",
        variant: "destructive",
      })
      return
    }

    // Capitalize first letter for consistency
    const formattedSkill = trimmedSkill.charAt(0).toUpperCase() + trimmedSkill.slice(1).toLowerCase()

    onSkillsChange([...skills, formattedSkill])
    setNewSkill("")
    toast({
      title: "Skill added",
      description: `Added "${formattedSkill}" to your ${label.toLowerCase()}.`,
    })
  }

  const removeSkill = (skillToRemove: string) => {
    onSkillsChange(skills.filter((skill) => skill !== skillToRemove))
    toast({
      title: "Skill removed",
      description: `Removed "${skillToRemove}" from your ${label.toLowerCase()}.`,
    })
  }

  const addSuggestion = (suggestion: string) => {
    // Check for case-insensitive duplicates
    const skillExists = skills.some((skill) => skill.toLowerCase() === suggestion.toLowerCase())

    if (!skillExists) {
      onSkillsChange([...skills, suggestion])
      toast({
        title: "Skill added",
        description: `Added "${suggestion}" to your ${label.toLowerCase()}.`,
      })
    }
  }

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">{label}</Label>

      {/* Add new skill */}
      <div className="flex gap-2">
        <Input
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              addSkill()
            }
          }}
          className="flex-1 bg-background"
        />
        <Button
          type="button"
          onClick={addSkill}
          size="sm"
          disabled={!newSkill.trim()}
          className="bg-foreground text-background hover:bg-foreground/90"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Current skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge key={skill} variant="secondary" className={colorClass}>
              {skill}
              <button
                onClick={() => removeSkill(skill)}
                className="ml-2 hover:text-destructive transition-colors"
                type="button"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Quick Add Suggestions */}
      <div className="space-y-3 p-4 rounded-lg bg-muted/40 border border-border">
        <p className="text-sm font-medium text-foreground">Quick Add Suggestions:</p>
        <div className="flex flex-wrap gap-2">
          {suggestions
            .filter((skill) => !skills.includes(skill))
            .slice(0, 8)
            .map((skill) => (
              <button
                key={skill}
                onClick={() => addSuggestion(skill)}
                className="text-sm px-3 py-1.5 rounded-md bg-background hover:bg-background/90 text-foreground border border-border/50 hover:border-border transition-all duration-200 flex items-center gap-1.5 group"
                type="button"
              >
                <Plus className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                {skill}
              </button>
            ))}
        </div>
      </div>

      {/* Skills count */}
      <p className="text-sm text-muted-foreground">
        {skills.length} skill{skills.length !== 1 ? "s" : ""} added
      </p>
    </div>
  )
}
