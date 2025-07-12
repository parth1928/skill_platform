"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { SkillInput } from "@/components/skill-input"
import { ImageUpload } from "@/components/image-upload"

const skillSuggestions = [
  "JavaScript",
  "Python",
  "React",
  "Node.js",
  "TypeScript",
  "Java",
  "C++",
  "PHP",
  "UI/UX Design",
  "Figma",
  "Adobe Creative Suite",
  "Photoshop",
  "Illustrator",
  "Machine Learning",
  "Data Science",
  "TensorFlow",
  "PyTorch",
  "SQL",
  "MongoDB",
  "Digital Marketing",
  "SEO",
  "Content Writing",
  "Social Media Marketing",
  "Photography",
  "Video Editing",
  "Adobe Premiere",
  "After Effects",
  "Public Speaking",
  "Project Management",
  "Leadership",
  "Communication",
  "Web Development",
  "Mobile Development",
  "iOS",
  "Android",
  "Flutter",
  "React Native",
  "DevOps",
  "AWS",
  "Docker",
  "Kubernetes",
  "CI/CD",
  "Linux",
  "System Administration",
]

export default function EditProfilePage() {
  const { user, updateProfile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [availability, setAvailability] = useState("Evenings")
  const [visibility, setVisibility] = useState<"Public" | "Private">("Private")
  const [skillsOffered, setSkillsOffered] = useState<string[]>([])
  const [skillsWanted, setSkillsWanted] = useState<string[]>([])
  const [newSkillOffered, setNewSkillOffered] = useState("")
  const [newSkillWanted, setNewSkillWanted] = useState("")
  const [profilePic, setProfilePic] = useState("")

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    // Populate form with existing user data
    setName(user.name || "")
    setLocation(user.location || "")
    setAvailability(user.availability || "Evenings")
    setVisibility(user.visibility || "Private")
    setSkillsOffered(user.skillsOffered || [])
    setSkillsWanted(user.skillsWanted || [])
    setProfilePic(user.profilePic || "")
  }, [user, router])

  const addSkillOffered = () => {
    const trimmedSkill = newSkillOffered.trim()
    if (!trimmedSkill) return

    // Check for case-insensitive duplicates
    const skillExists = skillsOffered.some((skill) => skill.toLowerCase() === trimmedSkill.toLowerCase())

    if (skillExists) {
      toast({
        title: "Skill already exists",
        description: "This skill is already in your offered skills list.",
        variant: "destructive",
      })
      return
    }

    // Capitalize first letter for consistency
    const formattedSkill = trimmedSkill.charAt(0).toUpperCase() + trimmedSkill.slice(1).toLowerCase()

    setSkillsOffered([...skillsOffered, formattedSkill])
    setNewSkillOffered("")
    toast({
      title: "Skill added",
      description: `Added "${formattedSkill}" to your offered skills.`,
    })
  }

  const addSkillWanted = () => {
    const trimmedSkill = newSkillWanted.trim()
    if (!trimmedSkill) return

    // Check for case-insensitive duplicates
    const skillExists = skillsWanted.some((skill) => skill.toLowerCase() === trimmedSkill.toLowerCase())

    if (skillExists) {
      toast({
        title: "Skill already exists",
        description: "This skill is already in your wanted skills list.",
        variant: "destructive",
      })
      return
    }

    // Capitalize first letter for consistency
    const formattedSkill = trimmedSkill.charAt(0).toUpperCase() + trimmedSkill.slice(1).toLowerCase()

    setSkillsWanted([...skillsWanted, formattedSkill])
    setNewSkillWanted("")
    toast({
      title: "Skill added",
      description: `Added "${formattedSkill}" to your wanted skills.`,
    })
  }

  const removeSkillOffered = (skill: string) => {
    setSkillsOffered(skillsOffered.filter((s) => s !== skill))
  }

  const removeSkillWanted = (skill: string) => {
    setSkillsWanted(skillsWanted.filter((s) => s !== skill))
  }

  const handleSave = async () => {
    // Validate required fields
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name.",
        variant: "destructive",
      })
      return
    }

    // Validate that user has at least some skills
    if (skillsOffered.length === 0 && skillsWanted.length === 0) {
      toast({
        title: "Skills required",
        description: "Please add at least one skill you offer or want to learn.",
        variant: "destructive",
      })
      return
    }

    console.log('Saving profile changes...')
    const updates = {
      name: name.trim(),
      location: location.trim(),
      availability,
      visibility,
      skillsOffered,
      skillsWanted,
      profilePic: profilePic || "/placeholder.svg?height=100&width=100",
    }
    console.log('Update data:', updates)

    // Update profile
    const success = await updateProfile(updates)
    
    if (!success) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Profile updated successfully!",
      description:
        "Your profile has been saved and is now " +
        (visibility === "Public" ? "visible to other users" : "private") +
        ".",
    })

    // Redirect to profile page
    router.push("/profile")
  }

  const handleDiscard = () => {
    router.push("/profile")
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container py-20">
        <div className="relative mb-16">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)]" />
          </div>

          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Edit Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Profile Photo */}
              <ImageUpload currentImage={profilePic} onImageChange={setProfilePic} userName={name || "User"} />

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground/80">Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="rounded-full bg-background/50 border-muted focus:border-primary transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-foreground/80">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, State/Country"
                    className="rounded-full bg-background/50 border-muted focus:border-primary transition-all duration-200"
                  />
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-2">
                <Label className="text-foreground/80">Availability</Label>
                <Select value={availability} onValueChange={setAvailability}>
                  <SelectTrigger className="rounded-full bg-background/50 border-muted hover:border-primary transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mornings">Mornings</SelectItem>
                    <SelectItem value="Evenings">Evenings</SelectItem>
                    <SelectItem value="Weekends">Weekends</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Skills Offered */}
              <SkillInput
                label="Skills I Offer"
                skills={skillsOffered}
                onSkillsChange={setSkillsOffered}
                placeholder="Add a skill you can teach"
                suggestions={skillSuggestions}
                colorClass="bg-secondary text-secondary-foreground"
              />

              {/* Skills Wanted */}
              <SkillInput
                label="Skills I Want to Learn"
                skills={skillsWanted}
                onSkillsChange={setSkillsWanted}
                placeholder="Add a skill you want to learn"
                suggestions={skillSuggestions}
                colorClass="bg-primary/10 text-primary"
              />

              {/* Profile Visibility */}
              <div className="flex items-center justify-between p-6 rounded-2xl bg-gradient-to-b from-muted/50 to-transparent border border-muted">
                <div className="space-y-1">
                  <Label className="text-foreground/80">Profile Visibility</Label>
                  <p className="text-sm text-muted-foreground">Make your profile visible to other users</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Label htmlFor="visibility" className="text-muted-foreground">Private</Label>
                  <Switch
                    id="visibility"
                    checked={visibility === "Public"}
                    onCheckedChange={(checked) => setVisibility(checked ? "Public" : "Private")}
                  />
                  <Label htmlFor="visibility" className="text-muted-foreground">Public</Label>
                </div>
              </div>

              {/* Profile Completion Status */}
              <div className="p-6 rounded-2xl bg-gradient-to-b from-primary/5 to-primary/10 border border-primary/20">
                <h4 className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-4">
                  Profile Completion
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${name.trim() ? "bg-primary" : "bg-muted-foreground/30"}`} />
                    <span className="text-sm text-muted-foreground">Name {name.trim() ? "✓" : "(required)"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${skillsOffered.length > 0 ? "bg-primary" : "bg-muted-foreground/30"}`} />
                    <span className="text-sm text-muted-foreground">Skills Offered ({skillsOffered.length})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${skillsWanted.length > 0 ? "bg-primary" : "bg-muted-foreground/30"}`} />
                    <span className="text-sm text-muted-foreground">Skills Wanted ({skillsWanted.length})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${location.trim() ? "bg-primary" : "bg-primary/40"}`} />
                    <span className="text-sm text-muted-foreground">Location {location.trim() ? "✓" : "(optional)"}</span>
                  </div>
                </div>
              </div>

              {/* Profile Preview */}
              <Card className="bg-gradient-to-b from-muted/50 to-transparent">
                <CardHeader>
                  <CardTitle className="text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Profile Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 mb-6">
                    <Avatar className="w-20 h-20 ring-4 ring-background">
                      <AvatarImage src={profilePic || "/placeholder.svg"} alt={name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                        {name.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-2xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {name || "Your Name"}
                      </h3>
                      {location && <p className="text-muted-foreground mt-1">{location}</p>}
                      <p className="text-sm text-muted-foreground mt-1">Available {availability}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-3">
                        Skills Offered ({skillsOffered.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {skillsOffered.length > 0 ? (
                          skillsOffered.slice(0, 3).map((skill) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="rounded-full px-3 py-1 bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            >
                              {skill}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">No skills added</span>
                        )}
                        {skillsOffered.length > 3 && (
                          <Badge
                            variant="secondary"
                            className="rounded-full px-3 py-1 bg-muted text-muted-foreground hover:bg-muted/80"
                          >
                            +{skillsOffered.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-3">
                        Skills Wanted ({skillsWanted.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {skillsWanted.length > 0 ? (
                          skillsWanted.slice(0, 3).map((skill) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="rounded-full px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20"
                            >
                              {skill}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">No skills added</span>
                        )}
                        {skillsWanted.length > 3 && (
                          <Badge
                            variant="secondary"
                            className="rounded-full px-3 py-1 bg-muted text-muted-foreground hover:bg-muted/80"
                          >
                            +{skillsWanted.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6">
                <Button
                  onClick={handleSave}
                  className="flex-1 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70"
                >
                  Save Profile
                </Button>
                <Button
                  onClick={handleDiscard}
                  variant="outline"
                  className="flex-1 rounded-full hover:bg-muted/50"
                >
                  Discard Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
