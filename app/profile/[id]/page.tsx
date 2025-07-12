"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MapPin, Clock, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"

interface User {
  _id: string
  name: string
  email?: string
  location?: string
  profilePic?: string
  skillsOffered: string[]
  skillsWanted: string[]
  availability: string
  visibility: "Public" | "Private"
  rating: number
  feedback: Array<{
    from: string
    message: string
    stars: number
  }>
}

export default function UserProfilePage() {
  const { user: currentUser } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [profileUser, setProfileUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userId = (params.id as string).padStart(24, '0')
        console.log("Fetching profile for user:", userId)

        const response = await fetch(`/api/users/${userId}`, {
          headers: currentUser?.token
            ? { Authorization: `Bearer ${currentUser.token}` }
            : {},
        })

        const data = await response.json()

        if (!response.ok) {
          console.error("API response error:", data)
          throw new Error(data.error || "Failed to fetch user profile")
        }

        const userData = data.user
        console.log("User data received:", userData)

        if (!userData || userData.visibility !== "Public") {
          router.push("/")
          return
        }

        setProfileUser(userData)
      } catch (error) {
        console.error("Error fetching profile:", error)
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [currentUser, params.id, router])

  const handleRequestSwap = () => {
    if (profileUser) {
      router.push(`/request/${profileUser._id}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container py-20">
          <div className="flex items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-b from-muted to-muted/50 rounded-full flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container py-20">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-gradient-to-b from-muted to-muted/50 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-3">
              User not found or profile is private
            </h3>
            <p className="text-muted-foreground">
              This user profile may be private or does not exist.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const canRequestSwap = currentUser?._id !== profileUser._id

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container py-20">
        <div className="relative mb-16">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)]" />
          </div>

          <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center space-y-6">
              <Avatar className="w-32 h-32 mx-auto mb-2 ring-4 ring-background">
                <AvatarImage src={profileUser.profilePic || "/placeholder.svg"} alt={profileUser.name} />
                <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                  {profileUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-3">
                <CardTitle className="text-3xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {profileUser.name}
                </CardTitle>

                <div className="flex items-center justify-center gap-6 text-muted-foreground">
                  {profileUser.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      <span>{profileUser.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span>Available {profileUser.availability}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <Star className="h-6 w-6 text-primary fill-primary" />
                  <span className="text-2xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {profileUser.rating}
                  </span>
                  <span className="text-muted-foreground">({profileUser.feedback.length} reviews)</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-10">
              {/* Skills Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-4">
                    Skills Offered
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profileUser.skillsOffered.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="rounded-full px-3 py-1 bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-4">
                    Skills Wanted
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profileUser.skillsWanted.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="rounded-full px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Request Button */}
              {canRequestSwap && (
                <div className="text-center pt-4">
                  <Button
                    onClick={handleRequestSwap}
                    size="lg"
                    className="rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 px-10"
                  >
                    Request Skill Swap
                  </Button>
                </div>
              )}

              {/* Feedback Section */}
              {profileUser.feedback.length > 0 && (
                <div className="pt-4">
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-6">
                    Reviews & Feedback
                  </h3>
                  <div className="space-y-6">
                    {profileUser.feedback.map((review, index) => (
                      <Card key={index} className="bg-gradient-to-b from-muted/50 to-transparent">
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-5 w-5 ${
                                    i < review.stars ? "text-primary fill-primary" : "text-muted-foreground/30"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {review.stars} out of 5 stars
                            </span>
                          </div>
                          <p className="text-muted-foreground">{review.message}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
