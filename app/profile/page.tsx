"use client"

import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MapPin, Clock, Edit, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  // Update the isProfileComplete check
  const isProfileComplete =
    user.name && user.name.trim() && (user.skillsOffered.length > 0 || user.skillsWanted.length > 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background/50 to-background relative">
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)] pointer-events-none" />
      
      <Navbar />

      <div className="container py-8 relative">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
            My Profile
          </h1>
          <Link href="/profile/edit">
            <Button className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </Link>
        </div>

        {/* Update the completion banner */}
        {!isProfileComplete && (
          <Card className="mb-6 bg-blue-500/10 backdrop-blur-sm border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">!</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-600 dark:text-blue-400 text-lg">Complete Your Profile</h3>
                  <p className="text-blue-600/90 dark:text-blue-400/90 text-sm mt-1">
                    Add your skills and preferences to start connecting with other users and make skill swaps.
                    {!user.name?.trim() && " Your name is required."}
                    {user.skillsOffered.length === 0 && user.skillsWanted.length === 0 && " Add at least one skill."}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!user.name?.trim() && (
                      <Badge variant="outline" className="text-blue-600 dark:text-blue-400 border-blue-500/30 backdrop-blur-sm">
                        Name Missing
                      </Badge>
                    )}
                    {user.skillsOffered.length === 0 && (
                      <Badge variant="outline" className="text-blue-600 dark:text-blue-400 border-blue-500/30 backdrop-blur-sm">
                        No Skills Offered
                      </Badge>
                    )}
                    {user.skillsWanted.length === 0 && (
                      <Badge variant="outline" className="text-blue-600 dark:text-blue-400 border-blue-500/30 backdrop-blur-sm">
                        No Skills Wanted
                      </Badge>
                    )}
                  </div>
                </div>
                <Link href="/profile/edit">
                  <Button className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300">
                    Complete Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="backdrop-blur-md bg-card/30 border-border/50">
          <CardHeader className="text-center space-y-4">
            <Avatar className="w-32 h-32 mx-auto mb-4 ring-2 ring-border/50">
              <AvatarImage src={user.profilePic || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback className="text-2xl bg-muted">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
              {user.name}
            </CardTitle>

            <div className="flex items-center justify-center gap-4 text-muted-foreground mt-2">
              {user.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{user.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Available {user.availability}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                {user.visibility === "Public" ? (
                  <Eye className="h-4 w-4 text-blue-500" />
                ) : (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={`text-sm ${user.visibility === "Public" ? "text-blue-500" : "text-muted-foreground"}`}>
                  {user.visibility} Profile
                </span>
              </div>
              {user.rating > 0 && (
                <>
                  <span className="text-muted-foreground/30">•</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-500">{user.rating}</span>
                  </div>
                </>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Skills Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
                  Skills I Offer
                </h3>
                {user.skillsOffered.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.skillsOffered.map((skill) => (
                      <Badge key={skill} variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 backdrop-blur-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No skills added yet</p>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-blue-600 dark:from-violet-400 dark:to-blue-400">
                  Skills I Want
                </h3>
                {user.skillsWanted.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.skillsWanted.map((skill) => (
                      <Badge key={skill} variant="secondary" className="bg-violet-500/10 text-violet-600 dark:text-violet-400 backdrop-blur-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No skills added yet</p>
                )}
              </div>
            </div>

            {/* Profile Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-500/10 to-violet-500/10 backdrop-blur-sm border-blue-500/20">
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
                    {user.skillsOffered.length}
                  </div>
                  <div className="text-sm text-blue-600/90 dark:text-blue-400/90">Skills Offered</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-violet-500/10 to-blue-500/10 backdrop-blur-sm border-violet-500/20">
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-blue-600 dark:from-violet-400 dark:to-blue-400">
                    {user.skillsWanted.length}
                  </div>
                  <div className="text-sm text-violet-600/90 dark:text-violet-400/90">Skills Wanted</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-violet-500/10 backdrop-blur-sm border-blue-500/20">
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
                    0
                  </div>
                  <div className="text-sm text-blue-600/90 dark:text-blue-400/90">Swaps Completed</div>
                </CardContent>
              </Card>

              <Card className={user.visibility === "Public" ? 
                "bg-gradient-to-br from-blue-500/10 to-violet-500/10 backdrop-blur-sm border-blue-500/20" : 
                "bg-muted/20 backdrop-blur-sm border-border/50"
              }>
                <CardContent className="pt-6 text-center">
                  <div className={`text-2xl font-bold ${user.visibility === "Public" ? 
                    "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400" : 
                    "text-muted-foreground"}`}>
                    {user.visibility === "Public" ? "👁️" : "🔒"}
                  </div>
                  <div className={`text-sm ${user.visibility === "Public" ? 
                    "text-blue-600/90 dark:text-blue-400/90" : 
                    "text-muted-foreground/90"}`}>
                    {user.visibility} Profile
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Feedback Section */}
            {user.feedback && user.feedback.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">
                  Reviews & Feedback
                </h3>
                <div className="space-y-4">
                  {user.feedback.map((review, index) => (
                    <Card key={index} className="backdrop-blur-sm bg-gradient-to-br from-blue-500/5 to-violet-500/5 border-border/50">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.stars ? "text-blue-500" : "text-muted-foreground/30"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">{review.stars} out of 5 stars</span>
                        </div>
                        <p className="text-foreground/90">{review.message}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/70">
                  View My Requests
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300">
                  Find Users to Connect
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
