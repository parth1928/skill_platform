"use client"

import { useState, useCallback } from "react"

interface SwapRequest {
  id: string
  fromUserId: string
  toUserId: string
  fromUserName: string
  toUserName: string
  fromUserPic?: string
  toUserPic?: string
  offeredSkill: string
  requestedSkill: string
  message: string
  status: "Pending" | "Accepted" | "Rejected"
  timestamp: string
}

// Mock swap requests with comprehensive sample data
const initialMockSwapRequests: SwapRequest[] = [
  {
    id: "swap1",
    fromUserId: "user2",
    toUserId: "user1",
    fromUserName: "Bob Smith",
    toUserName: "Alice Johnson",
    fromUserPic: "/placeholder.svg?height=100&width=100",
    toUserPic: "/placeholder.svg?height=100&width=100",
    offeredSkill: "Python",
    requestedSkill: "React",
    message:
      "Hi Alice! I'd love to learn React from you in exchange for Python lessons. I have 5 years of experience with Python and Django.",
    status: "Pending",
    timestamp: "2024-01-15T10:30:00Z",
  },
  {
    id: "swap2",
    fromUserId: "user3",
    toUserId: "user1",
    fromUserName: "Carol Davis",
    toUserName: "Alice Johnson",
    fromUserPic: "/placeholder.svg?height=100&width=100",
    toUserPic: "/placeholder.svg?height=100&width=100",
    offeredSkill: "UI/UX Design",
    requestedSkill: "JavaScript",
    message: "Would love to help you with design skills in exchange for JavaScript knowledge!",
    status: "Pending",
    timestamp: "2024-01-14T15:20:00Z",
  },
  {
    id: "swap3",
    fromUserId: "user1",
    toUserId: "user2",
    fromUserName: "Alice Johnson",
    toUserName: "Bob Smith",
    fromUserPic: "/placeholder.svg?height=100&width=100",
    toUserPic: "/placeholder.svg?height=100&width=100",
    offeredSkill: "JavaScript",
    requestedSkill: "Python",
    message: "Looking forward to learning Python from you!",
    status: "Accepted",
    timestamp: "2024-01-13T09:15:00Z",
  },
  {
    id: "swap4",
    fromUserId: "user1",
    toUserId: "user3",
    fromUserName: "Alice Johnson",
    toUserName: "Carol Davis",
    fromUserPic: "/placeholder.svg?height=100&width=100",
    toUserPic: "/placeholder.svg?height=100&width=100",
    offeredSkill: "React",
    requestedSkill: "Figma",
    message: "I'd like to learn Figma design skills!",
    status: "Rejected",
    timestamp: "2024-01-12T14:45:00Z",
  },
  {
    id: "swap5",
    fromUserId: "user4",
    toUserId: "user1",
    fromUserName: "David Wilson",
    toUserName: "Alice Johnson",
    fromUserPic: "/placeholder.svg?height=100&width=100",
    toUserPic: "/placeholder.svg?height=100&width=100",
    offeredSkill: "Machine Learning",
    requestedSkill: "Node.js",
    message: "I can teach ML concepts in exchange for Node.js backend development!",
    status: "Accepted",
    timestamp: "2024-01-11T11:20:00Z",
  },
  {
    id: "swap6",
    fromUserId: "user1",
    toUserId: "user4",
    fromUserName: "Alice Johnson",
    toUserName: "David Wilson",
    fromUserPic: "/placeholder.svg?height=100&width=100",
    toUserPic: "/placeholder.svg?height=100&width=100",
    offeredSkill: "Node.js",
    requestedSkill: "TensorFlow",
    message: "Excited to learn TensorFlow from you!",
    status: "Pending",
    timestamp: "2024-01-10T16:30:00Z",
  },
]

export function useSwapRequests() {
  const [requests, setRequests] = useState<SwapRequest[]>(initialMockSwapRequests)

  const acceptRequest = useCallback((requestId: string) => {
    setRequests((prev) => prev.map((req) => (req.id === requestId ? { ...req, status: "Accepted" as const } : req)))
  }, [])

  const rejectRequest = useCallback((requestId: string) => {
    setRequests((prev) => prev.map((req) => (req.id === requestId ? { ...req, status: "Rejected" as const } : req)))
  }, [])

  const addRequest = useCallback((newRequest: SwapRequest) => {
    setRequests((prev) => [newRequest, ...prev])
  }, [])

  const getFilteredRequests = useCallback(
    (userId: string, filterType: string) => {
      const filtered = requests.filter((req) => {
        if (filterType === "pending") {
          // Only incoming pending requests
          return req.toUserId === userId && req.status === "Pending"
        } else if (filterType === "sent") {
          // All requests sent by current user
          return req.fromUserId === userId
        } else if (filterType === "accepted") {
          // All accepted requests (both sent and received)
          return (req.toUserId === userId || req.fromUserId === userId) && req.status === "Accepted"
        } else if (filterType === "rejected") {
          // All rejected requests (both sent and received)
          return (req.toUserId === userId || req.fromUserId === userId) && req.status === "Rejected"
        }
        return false
      })

      return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    },
    [requests],
  )

  return {
    requests,
    acceptRequest,
    rejectRequest,
    addRequest,
    getFilteredRequests,
  }
}
