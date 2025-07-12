"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Search, MapPin, Clock, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import useDebounce from "@/src/hooks/use-debounce"

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

interface PaginationData {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function HomePage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [availabilityFilter, setAvailabilityFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 6,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const debouncedSearch = useDebounce(searchTerm, 300)

  useEffect(() => {
    // Don't fetch users if auth is still loading
    if (authLoading) return;

    const fetchUsers = async () => {
      try {
        setLoading(true)
        setError("")

        const searchParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: "6",
        })

        if (debouncedSearch) {
          searchParams.append("query", debouncedSearch)
        }

        if (availabilityFilter !== "all") {
          searchParams.append("availability", availabilityFilter)
        }

        const token = user?.token
        const headers: HeadersInit = {}
        if (token) {
          headers["Authorization"] = `Bearer ${token}`
        }

        const response = await fetch(`/api/users/search?${searchParams.toString()}`, {
          headers,
        })

        if (!response.ok) {
          throw new Error("Failed to fetch users")
        }

        const data = await response.json()
        setUsers(data.users)
        setPagination(data.pagination)
      } catch (err) {
        console.error("Error fetching users:", err)
        setError("Failed to load users. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [debouncedSearch, availabilityFilter, currentPage, user?.token, authLoading])

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
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />

      <div className="container py-20">
        {/* Hero Section */}
        <div className="relative text-center mb-20 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 -z-10">
            {/* Animated Grid */}
            <div className="absolute inset-0 hero-grid animate-grid-fade-in opacity-0" />
            
            {/* Center Glow */}
            <div className="absolute inset-0 hero-glow animate-glow-pulse" />
            
            {/* Radial Gradient Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--background)_70%)]" />
            
            {/* Glowing Lines */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 w-px h-32 bg-gradient-to-b from-foreground/20 to-transparent animate-glow-pulse" />
            <div className="absolute top-1/2 -translate-y-1/2 left-0 h-px w-32 bg-gradient-to-r from-transparent via-foreground/20 to-transparent animate-glow-pulse" />
            <div className="absolute top-1/2 -translate-y-1/2 right-0 h-px w-32 bg-gradient-to-l from-transparent via-foreground/20 to-transparent animate-glow-pulse" />
          </div>
          
          <div className="relative animate-fade-in">
            <div className="relative z-10 max-w-4xl mx-auto px-4">
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-foreground pb-2 mb-6 leading-tight">
                Professional Skill Exchange Platform
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                Connect with professionals to exchange expertise and accelerate your career growth.
              </p>
            </div>
            {/* Fade out effect at the bottom */}
            <div className="absolute inset-x-0 top-[calc(100%+1rem)] h-40 bg-gradient-to-b from-background to-transparent -z-10" />
            {/* Glowing lines */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-0 left-1/2 w-px h-32 bg-gradient-to-b from-foreground/10 to-transparent transform -translate-x-1/2" />
              <div className="absolute top-1/2 left-0 w-32 h-px bg-gradient-to-r from-foreground/10 to-transparent" />
              <div className="absolute top-1/2 right-0 w-32 h-px bg-gradient-to-l from-foreground/10 to-transparent" />
            </div>
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

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-muted-foreground">Loading professionals...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-destructive text-2xl">!</span>
            </div>
            <h3 className="text-xl font-semibold text-destructive mb-3">Error</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        )}

        {/* User Cards Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 max-w-7xl mx-auto">
            {users.map((profileUser) => (
              <div key={profileUser._id} className="rounded-2xl bg-gradient-to-b from-background to-muted/10 backdrop-blur p-8 border shadow-xl transition-all duration-200 hover:shadow-2xl hover:shadow-primary/5">
                <div className="text-center mb-6">                    <Avatar className="w-20 h-20 mx-auto mb-4 ring-4 ring-background">
                    <AvatarImage src={profileUser.profilePic || "/placeholder-user.jpg"} alt={profileUser.name} />
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
                      onClick={() => handleViewProfile(profileUser._id)}
                    >
                      View Profile
                    </Button>
                    <Button
                      className="flex-1 group"
                      onClick={() => handleRequest(profileUser._id)}
                    >
                      Request
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {/* Previous Page */}
            {currentPage > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                className="hover:bg-muted/50"
              >
                Previous
              </Button>
            )}

            {/* Page Numbers */}
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(page => {
                // Show first page, last page, current page, and pages around current page
                return (
                  page === 1 ||
                  page === pagination.totalPages ||
                  Math.abs(page - currentPage) <= 2
                )
              })
              .map((page, index, array) => (
                <React.Fragment key={page}>
                  {index > 0 && array[index - 1] !== page - 1 && (
                    <span className="px-2 text-muted-foreground">...</span>
                  )}
                  <Button
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
                </React.Fragment>
              ))}

            {/* Next Page */}
            {currentPage < pagination.totalPages && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                className="hover:bg-muted/50"
              >
                Next
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
