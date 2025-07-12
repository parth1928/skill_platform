"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface User {
  _id: string
  name: string
  email: string
  token: string
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
  updateProfile: (updates: Partial<User>) => Promise<boolean>
  isLoading?: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage
  useEffect(() => {
    try {
      console.log('Initializing auth state...')
      const storedUser = localStorage.getItem("currentUser")
      
      if (storedUser) {
        console.log('Found stored user data')
        const parsed = JSON.parse(storedUser)
        
        if (!parsed || !parsed.token) {
          console.error('Invalid or missing token in stored user data')
          localStorage.removeItem("currentUser")
          setUser(null)
        } else {
          console.log('Setting user state from storage:', {
            ...parsed,
            token: parsed.token ? 'exists' : 'missing'
          })
          setUser(parsed)
        }
      } else {
        console.log('No stored user data found')
        setUser(null)
      }
    } catch (error) {
      console.error("Error loading user from localStorage:", error)
      localStorage.removeItem("currentUser")
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login for:', email)
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        console.error('Login failed:', data.error || 'Unknown error')
        return false
      }

      console.log('Login successful, received user data:', { ...data.user, token: data.user.token ? 'exists' : 'missing' })
      setUser(data.user)
      localStorage.setItem("currentUser", JSON.stringify(data.user))
      return true
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      console.log('Starting registration process for:', email)
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      })

      console.log('Registration response status:', response.status)
      const data = await response.json()
      console.log('Registration response data:', { 
        ...data, 
        user: data.user ? {
          ...data.user,
          token: data.user.token ? 'exists' : 'missing'
        } : null 
      })
      
      if (!response.ok) {
        console.error('Registration failed:', data.error || 'Unknown error')
        return false
      }

      if (!data.user?.token) {
        console.error('No token received in user data')
        return false
      }

      const userToStore = {
        ...data.user,
        token: data.user.token // Ensure token is included
      }

      console.log('About to store user data:', {
        ...userToStore,
        token: userToStore.token ? 'exists' : 'missing'
      })

      setUser(userToStore)
      localStorage.setItem("currentUser", JSON.stringify(userToStore))

      // Verify storage
      const storedUser = localStorage.getItem("currentUser")
      const parsedStoredUser = storedUser ? JSON.parse(storedUser) : null
      console.log('Verified stored user:', {
        stored: !!storedUser,
        parsed: parsedStoredUser ? {
          ...parsedStoredUser,
          token: parsedStoredUser.token ? 'exists' : 'missing'
        } : null
      })

      return true
    } catch (error) {
      console.error("Registration error:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("currentUser")
  }

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!user || !user.token) {
      console.error('No user or token found for update')
      return false
    }

    try {
      const token = user.token // Store token locally
      console.log('Sending profile update with token:', token)
      console.log('Update data:', updates)
      
      // Include token in updates to maintain it
      const updatesWithToken = { ...updates, token }
      
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatesWithToken),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Profile update failed:', errorData)
        return false
      }

      const data = await response.json()
      if (!data.user || !data.user.token) {
        console.error('Invalid response from server:', data)
        return false
      }

      const updatedUser = { 
        ...user,
        ...data.user,
        token: data.user.token || user.token // Ensure token is preserved
      }
      console.log('Setting updated user:', { ...updatedUser, token: updatedUser.token ? 'exists' : 'missing' })
      setUser(updatedUser)
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
      return true
    } catch (error) {
      console.error("Profile update error:", error)
      return false
    }
  }

  // Don't render anything until we've checked for a stored user session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
