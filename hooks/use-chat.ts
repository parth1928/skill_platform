"use client"

import { useState, useCallback, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

interface Message {
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

interface Chat {
  _id: string;
  swapRequestId: string;
  messages: Message[];
  participants: string[];
  lastMessageAt: string;
}

export function useChat(swapRequestId: string) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!user?.token || !swapRequestId) return

    try {
      const response = await fetch(`/api/chat/${swapRequestId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }

      const data = await response.json()
      setMessages(data.chat?.messages || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError('Failed to load messages')
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [user, swapRequestId, toast])

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!user?.token || !swapRequestId) return

    try {
      const response = await fetch(`/api/chat/${swapRequestId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: content }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      setMessages(prev => [...prev, data.message])
      setError(null)
      return true
    } catch (err) {
      console.error('Error sending message:', err)
      setError('Failed to send message')
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
      return false
    }
  }, [user, swapRequestId, toast])

  // Initial fetch
  useEffect(() => {
    fetchMessages()
    
    // Set up polling for new messages
    const pollInterval = setInterval(fetchMessages, 3000)
    
    return () => clearInterval(pollInterval)
  }, [fetchMessages])

  return {
    messages,
    loading,
    error,
    sendMessage,
    refresh: fetchMessages,
  }
}
