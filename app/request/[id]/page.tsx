"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface User {
  uid: string
  name: string
  email: string
  location?: string
  profilePic?: string
  skillsOffered: string[]
  skillsWanted: string[]
  availability: string
  visibility: "Public" | "Private"
  rating: number
}

interface SwapRequest {
  id: string
  fromUserId: string
  toUserId: string
  offeredSkill: string
  requestedSkill: string
  message: string
  status: "Pending" | "Accepted" | "Rejected"
  timestamp: string
}

// Mock users data
const mockUsers: User[] = [
  {
    uid: "user1",
    name: "Alice Johnson",
    email: "alice@example.com",
    location: "San Francisco, CA",
    profilePic: "/placeholder.svg?height=100&width=100",
    skillsOffered: ["JavaScript", "React", "Node.js"],
    skillsWanted: ["Python", "Machine Learning", "Data Science"],
    availability: "Evenings",
    visibility: "Public",
    rating: 4.8,
  },
  {
    uid: "user2",
    name: "Bob Smith",
    email: "bob@example.com",
    location: "New York, NY",
    profilePic: "/placeholder.svg?height=100&width=100",
    skillsOffered: ["Python", "Django", "PostgreSQL"],
    skillsWanted: ["React", "TypeScript", "AWS"],
    availability: "Weekends",
    visibility: "Public",
    rating: 4.6,
  },
  {
    uid: "user3",
    name: "Carol Davis",
    email: "carol@example.com",
    location: "Austin, TX",
    profilePic: "/placeholder.svg?height=100&width=100",
    skillsOffered: ["UI/UX Design", "Figma", "Adobe Creative Suite"],
    skillsWanted: ["Frontend Development", "CSS", "JavaScript"],
    availability: "Mornings",
    visibility: "Public",
    rating: 4.9,
  },
]

// Mock swap requests storage
const mockSwapRequests: SwapRequest[] = []

export default function RequestSwapPage() {
  const { user: currentUser } = useAuth()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  const [targetUser, setTargetUser] = useState<User | null>(null)
  const [offeredSkill, setOfferedSkill] = useState("")
  const [requestedSkill, setRequestedSkill] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Skills that current user can offer that target user wants
  const [matchingOfferedSkills, setMatchingOfferedSkills] = useState<string[]>([])
  // Skills that target user offers that current user wants
  const [matchingRequestedSkills, setMatchingRequestedSkills] = useState<string[]>([])

  useEffect(() => {
    if (!currentUser) {
      router.push("/login")
      return
    }

    const userId = params.id as string
    const foundUser = mockUsers.find((u) => u.uid === userId)

    if (!foundUser || foundUser.visibility !== "Public") {
      router.push("/")
      return
    }

    if (foundUser.uid === currentUser.uid) {
      toast({
        title: "Invalid request",
        description: "You can't swap with yourself.",
        variant: "destructive",
      })
      router.push("/")
      return
    }

    setTargetUser(foundUser)

    // Find matching skills
    const offeredMatches = currentUser.skillsOffered.filter((skill) => foundUser.skillsWanted.includes(skill))
    const requestedMatches = foundUser.skillsOffered.filter((skill) => currentUser.skillsWanted.includes(skill))

    setMatchingOfferedSkills(offeredMatches)
    setMatchingRequestedSkills(requestedMatches)
    setLoading(false)
  }, [currentUser, params.id, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!offeredSkill || !requestedSkill) {
      toast({
        title: "Missing skills",
        description: "Please select both skills for the swap.",
        variant: "destructive",
      })
      return
    }

    // Check for existing pending request
    const existingRequest = mockSwapRequests.find(
      (req) => req.fromUserId === currentUser!.uid && req.toUserId === targetUser!.uid && req.status === "Pending",
    )

    if (existingRequest) {
      toast({
        title: "Request already exists",
        description: "You already have a pending request with this user.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      // Create new swap request
      const newRequest: SwapRequest = {
        id: `swap_${Date.now()}`,
        fromUserId: currentUser!.uid,
        toUserId: targetUser!.uid,
        offeredSkill,
        requestedSkill,
        message: message.trim(),
        status: "Pending",
        timestamp: new Date().toISOString(),
      }

      mockSwapRequests.push(newRequest)

      toast({
        title: "Swap request sent successfully!",
        description: `Your request to swap ${offeredSkill} for ${requestedSkill} has been sent to ${targetUser!.name}.`,
      })

      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send swap request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background/50 to-background relative">
        <Navbar />
        <div className="container flex items-center justify-center h-64">
          <div className="animate-pulse text-lg font-medium">Loading...</div>
        </div>
      </div>
    )
  }

  if (!targetUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background/50 to-background relative">
        <Navbar />
        <div className="container flex items-center justify-center h-64">
          <div className="text-lg font-medium text-foreground/80">User not found.</div>
        </div>
      </div>
    )
  }

  const hasValidMatch = matchingOfferedSkills.length > 0 && matchingRequestedSkills.length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-background/50 to-background relative">
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)] pointer-events-none" />
      
      <Navbar />

      <div className="container py-8 relative">
        <Card className="backdrop-blur-md bg-card/30 border-border/50">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
              Request Skill Swap
            </CardTitle>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Avatar className="w-16 h-16 ring-2 ring-border/50">
                <AvatarImage src={targetUser.profilePic || "/placeholder.svg"} alt={targetUser.name} />
                <AvatarFallback className="bg-muted">{targetUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{targetUser.name}</h3>
                <p className="text-muted-foreground">{targetUser.location}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {!hasValidMatch ? (
              <div className="text-center py-8">
                <div className="bg-destructive/10 backdrop-blur-sm border border-destructive/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-destructive mb-2">No Valid Skill Match</h3>
                  <p className="text-destructive/90 mb-4">
                    You don't have any skills that {targetUser.name} wants, or they don't have any skills that you want.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 text-left">
                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground">Your Skills:</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentUser!.skillsOffered.map((skill) => (
                          <Badge key={skill} variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 backdrop-blur-sm">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground">{targetUser.name}'s Wanted Skills:</h4>
                      <div className="flex flex-wrap gap-2">
                        {targetUser.skillsWanted.map((skill) => (
                          <Badge key={skill} variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 backdrop-blur-sm">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={() => router.push("/")} 
                    className="mt-6 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300"
                  >
                    Find Other Users
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-foreground/90" htmlFor="offeredSkill">Choose one of your offered skills</Label>
                  <Select value={offeredSkill} onValueChange={setOfferedSkill}>
                    <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border/50">
                      <SelectValue placeholder="Select a skill you can teach" />
                    </SelectTrigger>
                    <SelectContent>
                      {matchingOfferedSkills.map((skill) => (
                        <SelectItem key={skill} value={skill}>
                          {skill}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">Skills you offer that {targetUser.name} wants to learn</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground/90" htmlFor="requestedSkill">Choose one of their offered skills</Label>
                  <Select value={requestedSkill} onValueChange={setRequestedSkill}>
                    <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border/50">
                      <SelectValue placeholder="Select a skill you want to learn" />
                    </SelectTrigger>
                    <SelectContent>
                      {matchingRequestedSkills.map((skill) => (
                        <SelectItem key={skill} value={skill}>
                          {skill}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">Skills {targetUser.name} offers that you want to learn</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground/90" htmlFor="message">Optional Message</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Add a personal message (optional)"
                    rows={4}
                    className="bg-background/50 backdrop-blur-sm border-border/50 resize-none"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300" 
                  disabled={submitting}
                >
                  {submitting ? "Sending Request..." : "Send Swap Request"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
