"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useRouter, useParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface User {
  _id: string
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
  const [matchingOfferedSkills, setMatchingOfferedSkills] = useState<string[]>([])
  const [matchingRequestedSkills, setMatchingRequestedSkills] = useState<string[]>([])

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return router.push("/login")
      const userId = params.id as string

      try {
        const res = await fetch(`/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Error fetching user")

        if (!data.user || data.user.visibility !== "Public") {
          toast({ title: "User not accessible", variant: "destructive" })
          return router.push("/")
        }
        if (data.user._id === currentUser._id) {
          toast({ title: "Cannot swap with yourself", variant: "destructive" })
          return router.push("/")
        }

        const foundUser = data.user
        setTargetUser(foundUser)
        setMatchingOfferedSkills(
          currentUser.skillsOffered?.filter((s: string) => foundUser.skillsWanted?.includes(s)) || []
        )
        setMatchingRequestedSkills(
          foundUser.skillsOffered?.filter((s: string) => currentUser.skillsWanted?.includes(s)) || []
        )
      } catch (err) {
        toast({ title: "Error", description: "Failed to fetch user", variant: "destructive" })
        router.push("/")
      } finally {
        setLoading(false)
      }
    }
    fetchUserData()
  }, [currentUser, params.id, router, toast])

  const hasValidMatch = matchingOfferedSkills.length > 0 && matchingRequestedSkills.length > 0

  if (loading || !targetUser) return <div className="min-h-screen bg-background" />

  return (
    <div className="min-h-screen bg-gradient-to-br from-background/50 to-background relative">
      <Navbar />
      <div className="container py-8">
        <Card className="backdrop-blur-md bg-card/30 border-border/50">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-2xl font-bold">Request Skill Swap</CardTitle>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Avatar className="w-16 h-16 ring-2 ring-border/50">
                <AvatarImage src={targetUser.profilePic || "/placeholder.svg"} alt={targetUser.name} />
                <AvatarFallback>{targetUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{targetUser.name}</h3>
                <p className="text-muted-foreground">{targetUser.location}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {!hasValidMatch ? (
              <div className="text-center space-y-6 py-10">
                <Badge variant="destructive" className="px-4 py-2 text-base font-semibold">
                   No Valid Skill Match
                </Badge>
                <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                  You don’t have any skills <strong>{targetUser.name}</strong> wants,
                  or they don’t offer any skills you’re looking for.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div>
                    <h4 className="font-medium mb-2 text-foreground">Your Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentUser!.skillsOffered.map((skill) => (
                        <Badge key={skill} variant="outline" className="border-slate-300 text-slate-700">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-foreground">{targetUser.name}'s Wanted Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {targetUser.skillsWanted.map((skill) => (
                        <Badge key={skill} variant="outline" className="border-slate-300 text-slate-700">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Button onClick={() => router.push("/")} className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 mt-4">
                  Find other users
                </Button>
              </div>
            ) : (              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!offeredSkill || !requestedSkill) {
                  toast({
                    title: "Skills required",
                    description: "Please select both skills for the swap.",
                    variant: "destructive",
                  });
                  return;
                }

                setSubmitting(true);
                try {
                  const response = await fetch('/api/swap-requests', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${currentUser!.token}`,
                    },
                    body: JSON.stringify({
                      toUserId: targetUser._id,
                      offeredSkill,
                      requestedSkill,
                      message: message.trim(),
                    }),
                  });

                  const data = await response.json();

                  if (!response.ok) {
                    throw new Error(data.error || 'Failed to send request');
                  }

                  toast({
                    title: "Request sent!",
                    description: `Your swap request has been sent to ${targetUser.name}.`,
                  });

                  // Redirect to dashboard after successful request
                  router.push('/dashboard');
                } catch (error) {
                  console.error('Error sending swap request:', error);
                  toast({
                    title: "Error",
                    description: error instanceof Error ? error.message : "Failed to send request",
                    variant: "destructive",
                  });
                } finally {
                  setSubmitting(false);
                }
              }} className="space-y-6">
        
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
                  className="w-full bg-blue hover:from-blue-500 hover:to white hover:shadow-blue-500/30 transition-all duration-300" 
                  disabled={submitting || !offeredSkill || !requestedSkill}
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
