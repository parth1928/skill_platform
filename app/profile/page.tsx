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

  const isProfileComplete =
    user.name && user.name.trim() && (user.skillsOffered.length > 0 || user.skillsWanted.length > 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute inset-0 bg-background/90" />
      
      <Navbar />

      <div className="container py-8 relative">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            My Profile
          </h1>
          <Link href="/profile/edit">
            <Button variant="outline" className="hover:bg-muted/50 border-2 transition-all duration-200">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </Link>
        </div>

        {!isProfileComplete && (
          <Card className="mb-6 border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-foreground font-bold text-lg">!</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-lg">Complete Your Profile</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Add your skills and preferences to start connecting with other users and make skill swaps.
                    {!user.name?.trim() && " Your name is required."}
                    {user.skillsOffered.length === 0 && user.skillsWanted.length === 0 && " Add at least one skill."}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!user.name?.trim() && (
                      <Badge variant="outline" className="text-foreground border">
                        Name Missing
                      </Badge>
                    )}
                    {user.skillsOffered.length === 0 && (
                      <Badge variant="outline" className="text-foreground border">
                        No Skills Offered
                      </Badge>
                    )}
                    {user.skillsWanted.length === 0 && (
                      <Badge variant="outline" className="text-foreground border">
                        No Skills Wanted
                      </Badge>
                    )}
                  </div>
                </div>
                <Link href="/profile/edit">
                  <Button className="bg-background text-foreground hover:bg-muted/50 border-2 transition-all duration-200">
                    Complete Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border shadow-lg">
          <CardHeader className="text-center space-y-4">
            <Avatar className="w-32 h-32 mx-auto mb-4 ring-2 ring-border">
              <AvatarImage src={user.profilePic || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback className="text-2xl bg-muted">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <CardTitle className="text-3xl font-bold text-foreground">
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
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm text-muted-foreground">
                  {user.visibility} Profile
                </span>
              </div>
              {user.rating > 0 && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    <span className="text-sm">{user.rating}</span>
                  </div>
                </>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">
                  Skills I Offer
                </h3>
                {user.skillsOffered.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.skillsOffered.map((skill) => (
                      <Badge key={skill} variant="secondary" className="bg-muted text-foreground">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No skills added yet</p>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">
                  Skills I Want
                </h3>
                {user.skillsWanted.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.skillsWanted.map((skill) => (
                      <Badge key={skill} variant="secondary" className="bg-muted text-foreground">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No skills added yet</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border bg-muted/5">
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {user.skillsOffered.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Skills Offered</div>
                </CardContent>
              </Card>

              <Card className="border bg-muted/5">
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {user.skillsWanted.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Skills Wanted</div>
                </CardContent>
              </Card>

              <Card className="border bg-muted/5">
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-foreground">
                    0
                  </div>
                  <div className="text-sm text-muted-foreground">Swaps Completed</div>
                </CardContent>
              </Card>

              <Card className="border bg-muted/5">
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {user.visibility === "Public" ? "👁️" : "🔒"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {user.visibility} Profile
                  </div>
                </CardContent>
              </Card>
            </div>

            {user.feedback && user.feedback.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Reviews & Feedback
                </h3>
                <div className="space-y-4">
                  {user.feedback.map((review, index) => (
                    <Card key={index} className="border bg-muted/5">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.stars ? "text-foreground" : "text-muted"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">{review.stars} out of 5 stars</span>
                        </div>
                        <p className="text-foreground">{review.message}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard" className="flex-1">
                <Button 
                  variant="outline" 
                  className="w-full h-12 border-2 hover:bg-muted/50 transition-all duration-200"
                >
                  View My Requests
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button 
                  className="w-full h-12 bg-background text-foreground hover:bg-muted/50 border-2 transition-all duration-200"
                >
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
