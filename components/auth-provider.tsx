"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

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
  feedback: Array<{
    from: string
    message: string
    stars: number
  }>
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  updateProfile: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

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
    feedback: [
      { from: "user2", message: "Great teacher! Very patient.", stars: 5 },
      { from: "user3", message: "Excellent React knowledge.", stars: 5 },
    ],
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
    feedback: [{ from: "user1", message: "Very knowledgeable in Python.", stars: 5 }],
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
    feedback: [{ from: "user1", message: "Amazing design skills!", stars: 5 }],
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login - in real app, this would call your auth API
    const foundUser = mockUsers.find((u) => u.email === email)
    if (foundUser && password === "password") {
      setUser(foundUser)
      localStorage.setItem("currentUser", JSON.stringify(foundUser))
      return true
    }
    return false
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    // Mock registration
    const newUser: User = {
      uid: `user${Date.now()}`,
      name,
      email,
      skillsOffered: [],
      skillsWanted: [],
      availability: "Evenings",
      visibility: "Private",
      rating: 0,
      feedback: [],
    }

    mockUsers.push(newUser)
    setUser(newUser)
    localStorage.setItem("currentUser", JSON.stringify(newUser))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("currentUser")
  }

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))

      // Update in mock data
      const userIndex = mockUsers.findIndex((u) => u.uid === user.uid)
      if (userIndex !== -1) {
        mockUsers[userIndex] = updatedUser
      }
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile }}>{children}</AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
