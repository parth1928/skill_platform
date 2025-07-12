"use client"

import Link from "next/link"
import { useAuth } from "./auth-provider"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "./ui/dropdown-menu"
import { User, LogOut, Settings, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function Navbar() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center space-x-2 transition-opacity hover:opacity-80"
          >
            <span className="text-xl font-semibold tracking-tight text-foreground">
              SkillSwap
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link href="/">
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md px-4 font-medium"
              >
                Browse
              </Button>
            </Link>

            {user && (
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md px-4 font-medium"
                >
                  Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md w-10 h-10"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative rounded-full h-10 w-10 ring-2 ring-border/40 hover:ring-border transition-all duration-200 hover:bg-muted/50"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.profilePic || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback className="bg-muted text-foreground">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-2" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user.name && (
                      <p className="font-medium text-sm text-foreground">{user.name}</p>
                    )}
                    <p className="text-xs text-muted-foreground truncate w-[160px]">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile/edit" className="flex items-center cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button
                className="bg-foreground text-background hover:bg-foreground/90 rounded-md px-4 h-10 font-medium"
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
