"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { register } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (password.length < 8) {
        toast({
          title: "Password too short",
          description: "Password must be at least 8 characters long.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      console.log('Starting registration process...')
      const success = await register(email, password, name)
      
      if (success) {
        console.log('Registration successful, verifying stored data...')
        const storedUser = localStorage.getItem("currentUser")
        if (!storedUser) {
          console.error('User data not found in storage after registration')
          toast({
            title: "Registration error",
            description: "Failed to save user data. Please try again.",
            variant: "destructive",
          })
          return
        }

        const userData = JSON.parse(storedUser)
        if (!userData.token) {
          console.error('Token missing from stored user data')
          toast({
            title: "Registration error",
            description: "Authentication data missing. Please try logging in.",
            variant: "destructive",
          })
          return
        }

        console.log('Registration complete, redirecting to profile edit...')
        toast({
          title: "Account created",
          description: "Welcome to SkillSwap Pro! Complete your profile to get started.",
        })
        
        // Small delay to ensure state is updated before navigation
        setTimeout(() => {
          router.push("/profile/edit")
        }, 100)
      } else {
        toast({
          title: "Registration failed",
          description: "Email already exists or invalid data.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
              <CardDescription className="mt-2">
                Enter your details below to create your account
              </CardDescription>
            </div>
            <Button variant="ghost" className="text-sm" onClick={() => router.push('/login')}>
              Login
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button 
            type="submit" 
            className="w-full"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Please wait..." : "Create Account"}
          </Button>
          <Button variant="outline" className="w-full">
            Sign up with LinkedIn
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
