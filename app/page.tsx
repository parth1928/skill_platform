"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Search, MapPin, Clock, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

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

// Mock data
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
  {
    uid: "user4",
    name: "David Wilson",
    email: "david@example.com",
    location: "Seattle, WA",
    profilePic: "/placeholder.svg?height=100&width=100",
    skillsOffered: ["Machine Learning", "TensorFlow", "Data Analysis"],
    skillsWanted: ["Web Development", "React", "JavaScript"],
    availability: "Weekends",
    visibility: "Public",
    rating: 4.7,
  },
  {
    uid: "user5",
    name: "Emma Brown",
    email: "emma@example.com",
    location: "Chicago, IL",
    profilePic: "/placeholder.svg?height=100&width=100",
    skillsOffered: ["Digital Marketing", "SEO", "Content Writing"],
    skillsWanted: ["Graphic Design", "Photography", "Video Editing"],
    availability: "Evenings",
    visibility: "Public",
    rating: 4.5,
  },
  {
    uid: "user6",
    name: "Frank Miller",
    email: "frank@example.com",
    location: "Denver, CO",
    profilePic: "/placeholder.svg?height=100&width=100",
    skillsOffered: ["Photography", "Video Editing", "Adobe Premiere"],
    skillsWanted: ["Web Design", "CSS", "JavaScript"],
    availability: "Mornings",
    visibility: "Public",
    rating: 4.4,
  },
]

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [availabilityFilter, setAvailabilityFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])

  const usersPerPage = 6

  useEffect(() => {
    let filtered = mockUsers.filter((u) => u.visibility === "Public" && u.uid !== user?.uid)

    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.skillsOffered.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
          u.skillsWanted.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (availabilityFilter !== "all") {
      filtered = filtered.filter((u) => u.availability.toLowerCase() === availabilityFilter)
    }

    setFilteredUsers(filtered)
    setCurrentPage(1)
  }, [searchTerm, availabilityFilter, user])

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
  const startIndex = (currentPage - 1) * usersPerPage
  const currentUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage)

  const handleRequest = (targetUserId: string) => {
    if (!user) {
      router.push("/login")
      return
    }
    router.push(`/request/${targetUserId}`)
  }

  const handleViewProfile = (targetUserId: string) => {
    if (!user) {
      router.push("/login")
      return
    }
    router.push(`/profile/${targetUserId}`)
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container py-20">
        {/* Hero Section */}
        <div className="relative text-center mb-20">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)]" />
          </div>
          <div className="relative">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent pb-2 mb-4">
              Professional Skill Exchange Platform
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect with professionals to exchange expertise and accelerate your career growth.
            </p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="rounded-2xl bg-gradient-to-b from-background to-muted/10 backdrop-blur p-8 shadow-2xl mb-12 border">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search professionals by name or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 pl-12 rounded-full bg-background/50 border-muted focus:border-primary transition-all duration-200"
              />
            </div>
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="w-full lg:w-64 h-12 rounded-full bg-background/50 border-muted hover:border-primary transition-all duration-200">
                <SelectValue placeholder="Filter by availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Availability</SelectItem>
                <SelectItem value="mornings">Mornings</SelectItem>
                <SelectItem value="evenings">Evenings</SelectItem>
                <SelectItem value="weekends">Weekends</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* User Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 max-w-7xl mx-auto">
          {currentUsers.map((profileUser) => (
            <div key={profileUser.uid} className="rounded-2xl bg-gradient-to-b from-background to-muted/10 backdrop-blur p-8 border shadow-xl transition-all duration-200 hover:shadow-2xl hover:shadow-primary/5">
              <div className="text-center mb-6">
                <Avatar className="w-20 h-20 mx-auto mb-4 ring-4 ring-background">
                  <AvatarImage src={profileUser.profilePic || "/placeholder.svg"} alt={profileUser.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                    {profileUser.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {profileUser.name}
                </h3>
                {profileUser.location && (
                  <div className="flex items-center justify-center gap-1.5 text-muted-foreground mt-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{profileUser.location}</span>
                  </div>
                )}
                <div className="flex items-center justify-center gap-3 mt-3">
                  <div className="flex items-center gap-1.5">
                    <Star className="h-5 w-5 fill-primary text-primary" />
                    <span className="text-sm font-medium">{profileUser.rating}</span>
                  </div>
                  <span className="text-muted-foreground/40">•</span>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{profileUser.availability}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-foreground/80 mb-3 text-sm">Skills Offered</h4>
                  <div className="flex flex-wrap gap-2">
                    {profileUser.skillsOffered.slice(0, 3).map((skill) => (
                      <Badge
                        key={skill}
                        className="rounded-full px-3 py-1 bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {profileUser.skillsOffered.length > 3 && (
                      <Badge
                        className="rounded-full px-3 py-1 bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      >
                        +{profileUser.skillsOffered.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-foreground/80 mb-3 text-sm">Skills Wanted</h4>
                  <div className="flex flex-wrap gap-2">
                    {profileUser.skillsWanted.slice(0, 3).map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="rounded-full px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {profileUser.skillsWanted.length > 3 && (
                      <Badge
                        variant="secondary"
                        className="rounded-full px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20"
                      >
                        +{profileUser.skillsWanted.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleViewProfile(profileUser.uid)}
                  >
                    View Profile
                  </Button>
                  <Button
                    className="flex-1 group"
                    onClick={() => handleRequest(profileUser.uid)}
                  >
                    Request
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={
                  currentPage === page
                    ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20"
                    : "hover:bg-muted/50"
                }
              >
                {page}
              </Button>
            ))}
          </div>
        )}

        {filteredUsers.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-b from-muted to-muted/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-3">
              No professionals found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
