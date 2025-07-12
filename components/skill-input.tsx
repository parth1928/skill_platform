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
          className="flex-1"
        />
        <Button type="button" onClick={addSkill} size="sm" disabled={!newSkill.trim()}>
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
                className="ml-2 hover:text-red-600 transition-colors"
                type="button"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Suggestions */}
      <div className="space-y-2">
        <p className="text-sm text-gray-600 font-medium">Quick Add Suggestions:</p>
        <div className="flex flex-wrap gap-1">
          {suggestions
            .filter((skill) => !skills.includes(skill))
            .slice(0, 8)
            .map((skill) => (
              <button
                key={skill}
                onClick={() => addSuggestion(skill)}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors border border-gray-200 hover:border-gray-300"
                type="button"
              >
                + {skill}
              </button>
            ))}
        </div>
      </div>

      {/* Skills count */}
      <p className="text-sm text-gray-500">
        {skills.length} skill{skills.length !== 1 ? "s" : ""} added
      </p>
    </div>
  )
}
