"use client"

import { useState, useCallback, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

interface SwapRequest {
  _id: string
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
  createdAt: string
  updatedAt: string
}

export function useSwapRequests() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [requests, setRequests] = useState<SwapRequest[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch all swap requests
  const fetchRequests = useCallback(async () => {
    if (!user?.token) return

    try {
      const response = await fetch('/api/swap-requests', {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch requests')
      }

      const data = await response.json()
      setRequests(data.requests)
    } catch (error) {
      console.error('Error fetching swap requests:', error)
      toast({
        title: "Error",
        description: "Failed to load swap requests",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [user, toast])

  // Initial fetch
  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  // Accept a request
  const acceptRequest = useCallback(async (requestId: string) => {
    if (!user?.token) return

    try {
      const response = await fetch(`/api/swap-requests/${requestId}/accept`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const errorMsg = errorData?.error || 'Failed to accept request'
        throw new Error(errorMsg)
      }

      setRequests(prev => prev.map(req => 
        req._id === requestId ? { ...req, status: "Accepted" } : req
      ))

      toast({
        title: "Success",
        description: "Request accepted successfully",
      })
    } catch (error: any) {
      console.error('Error accepting request:', error)
      toast({
        title: "Error",
        description: error?.message || "Failed to accept request",
        variant: "destructive",
      })
    }
  }, [user, toast])

  // Reject a request
  const rejectRequest = useCallback(async (requestId: string) => {
    if (!user?.token) return

    try {
      const response = await fetch(`/api/swap-requests/${requestId}/reject`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const errorMsg = errorData?.error || 'Failed to reject request'
        throw new Error(errorMsg)
      }

      setRequests(prev => prev.map(req => 
        req._id === requestId ? { ...req, status: "Rejected" } : req
      ))

      toast({
        title: "Success",
        description: "Request rejected successfully",
      })
    } catch (error: any) {
      console.error('Error rejecting request:', error)
      toast({
        title: "Error",
        description: error?.message || "Failed to reject request",
        variant: "destructive",
      })
    }
  }, [user, toast])

  // Filter requests based on type
  const getFilteredRequests = useCallback(
    (userId: string, filterType: string) => {
      return requests.filter((req) => {
        switch (filterType) {
          case "pending":
            // Only incoming pending requests
            return req.toUserId === userId && req.status === "Pending"
          case "sent":
            // All requests sent by current user
            return req.fromUserId === userId
          case "accepted":
            // All accepted requests (both sent and received)
            return (req.toUserId === userId || req.fromUserId === userId) && req.status === "Accepted"
          case "rejected":
            // All rejected requests (both sent and received)
            return (req.toUserId === userId || req.fromUserId === userId) && req.status === "Rejected"
          default:
            return false
        }
      }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    },
    [requests]
  )

  return {
    requests,
    loading,
    acceptRequest,
    rejectRequest,
    getFilteredRequests,
    refresh: fetchRequests,
  }
}
