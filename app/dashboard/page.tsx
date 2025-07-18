"use client"

import { useEffect, useRef } from "react"
import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, CheckCircle, XCircle, Send, Inbox, ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useSwapRequests } from "@/hooks/use-swap-requests"
import { useChat } from "@/hooks/use-chat"

interface ChatUser {
  name: string;
  pic?: string;
  id: string;
  swapRequestId: string;
}

const ChatModal = ({ chatUser, chatOpen, setChatOpen }: { chatUser: ChatUser | null, chatOpen: boolean, setChatOpen: (open: boolean) => void }) => {
  const { user } = useAuth()  // Add this line to get user context
  const [newMessage, setNewMessage] = useState("")
  const { messages, sendMessage, loading: chatLoading } = useChat(chatUser?.swapRequestId || "")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return  // Add user check

    const success = await sendMessage(newMessage)
    if (success) {
      setNewMessage("")
    }
  }

  if (!chatOpen || !chatUser || !user) return null  // Add user check

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setChatOpen(false)}>
      <div 
        className="bg-background rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Chat with {chatUser.name}</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full" 
            onClick={() => setChatOpen(false)}
          >
            <XCircle className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4 bg-muted/30 rounded-lg min-h-[400px]">
          {chatLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.senderId === user?._id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                    msg.senderId === user?._id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary'
                  }`}
                >
                  <p className="text-sm mb-1">{msg.content}</p>
                  <p className="text-xs opacity-70">
                    {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-full px-4 py-2 bg-muted/30 border border-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <Button 
            type="submit" 
            className="rounded-full bg-gradient-to-r from-primary to-primary/80"
            disabled={!newMessage.trim()}
          >
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
        </form>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { requests, acceptRequest, rejectRequest, getFilteredRequests, loading, refresh } = useSwapRequests()

  const [activeTab, setActiveTab] = useState("pending")
  const [chatOpen, setChatOpen] = useState(false)
  const [chatUser, setChatUser] = useState<ChatUser | null>(null)

  // Add immediate user check at the top
  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
  }, [user, router])

  // Early return if no user
  if (!user) {
    return null
  }

  const handleAcceptRequest = async (requestId: string) => {
    await acceptRequest(requestId)
    await refresh()
    toast({
      title: "Request accepted! 🎉",
      description: "The swap request has been accepted successfully. You can now coordinate with the other user!",
    })
  }

  const handleRejectRequest = async (requestId: string) => {
    await rejectRequest(requestId)
    await refresh()
    toast({
      title: "Request rejected",
      description: "The swap request has been rejected.",
    })
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const renderRequestCard = (request: any, showActions = false) => {
    const isIncoming = request.toUserId === user._id
    const otherUser = isIncoming
      ? {
          name: request.fromUserName,
          pic: request.fromUserPic,
          id: request.fromUserId,
        }
      : {
          name: request.toUserName,
          pic: request.toUserPic,
          id: request.toUserId,
        }

    return (
      <Card key={request._id} className="hover:shadow-2xl hover:shadow-primary/5 transition-all duration-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="w-16 h-16 ring-4 ring-background">
              <AvatarImage src={otherUser.pic || "/placeholder.svg"} alt={otherUser.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {otherUser.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {otherUser.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isIncoming ? "Wants to swap with you" : "You requested a swap"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {request.status === "Pending" && (
                    <Badge variant="outline" className="rounded-full bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      Pending
                    </Badge>
                  )}
                  {request.status === "Accepted" && (
                    <Badge variant="outline" className="rounded-full bg-primary/10 text-primary border-primary/20">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      Accepted
                    </Badge>
                  )}
                  {request.status === "Rejected" && (
                    <Badge variant="outline" className="rounded-full bg-destructive/10 text-destructive border-destructive/20">
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Rejected
                    </Badge>
                  )}
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-2xl mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-foreground/80 mb-2">
                      {isIncoming ? `${otherUser.name} offers:` : "You offered:"}
                    </p>
                    <Badge variant="secondary" className="rounded-full px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20">
                      {request.offeredSkill}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground/80 mb-2">
                      {isIncoming ? `${otherUser.name} wants:` : "You requested:"}
                    </p>
                    <Badge variant="secondary" className="rounded-full px-3 py-1 bg-secondary text-secondary-foreground hover:bg-secondary/80">
                      {request.requestedSkill}
                    </Badge>
                  </div>
                </div>
              </div>

              {request.message && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-foreground/80 mb-2">Message:</p>
                  <div className="bg-muted/30 p-4 rounded-2xl border border-muted">
                    <p className="text-sm text-muted-foreground">{request.message}</p>
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500 mb-3">{formatDate(request.createdAt)}</p>

              {showActions && request.status === "Pending" && isIncoming && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleAcceptRequest(request._id)}
                    className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 rounded-full"
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleRejectRequest(request._id)}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive rounded-full"
                  >
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}

              {request.status === "Accepted" && (
                <div className="bg-gradient-to-b from-primary/5 to-primary/10 border border-primary/20 p-6 rounded-2xl">
                  <p className="text-base text-foreground mb-4">
                    🎉 Swap accepted! You can now coordinate with {otherUser.name} to schedule your skill exchange.
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      className="rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70"
                      onClick={() => {
                        setChatOpen(true);
                        setChatUser({
                          name: otherUser.name,
                          pic: otherUser.pic,
                          id: otherUser.id,
                          swapRequestId: request._id
                        });
                      }}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat with {otherUser.name}
                    </Button>
                    <Button variant="outline" className="rounded-full hover:bg-primary/10">
                      Leave Feedback
                    </Button>
                  </div>
                </div>
              )}

              {request.status === "Rejected" && (
                <div className="bg-gradient-to-b from-destructive/5 to-destructive/10 border border-destructive/20 p-6 rounded-2xl">
                  <p className="text-base text-foreground">
                    This swap request was {isIncoming ? "rejected by you" : `rejected by ${otherUser.name}`}.
                  </p>
                </div>
              )}

              {request.status === "Pending" && !isIncoming && (
                <div className="bg-gradient-to-b from-yellow-500/5 to-yellow-500/10 border border-yellow-500/20 p-6 rounded-2xl">
                  <p className="text-base text-foreground">Waiting for {otherUser.name} to respond to your swap request.</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Get counts for each tab
  const pendingCount = getFilteredRequests(user._id, "pending").length
  const sentCount = getFilteredRequests(user._id, "sent").length
  const acceptedCount = getFilteredRequests(user._id, "accepted").length
  const rejectedCount = getFilteredRequests(user._id, "rejected").length

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <div className="container py-8 max-w-6xl">
        <Tabs defaultValue="pending" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 p-1 bg-muted rounded-full">
            <TabsTrigger value="pending" className="rounded-full data-[state=active]:bg-background">
              <div className="flex items-center gap-2">
                <Inbox className="w-4 h-4" />
                Pending ({pendingCount})
              </div>
            </TabsTrigger>
            <TabsTrigger value="sent" className="rounded-full data-[state=active]:bg-background">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Sent ({sentCount})
              </div>
            </TabsTrigger>
            <TabsTrigger value="accepted" className="rounded-full data-[state=active]:bg-background">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Accepted ({acceptedCount})
              </div>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="rounded-full data-[state=active]:bg-background">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Rejected ({rejectedCount})
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Inbox className="w-6 h-6 text-yellow-500" />
                  Incoming Requests
                </CardTitle>
                <p className="text-muted-foreground">Manage your skill swap requests and connections</p>
              </CardHeader>
              <CardContent>
                {pendingCount === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-b from-muted to-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Inbox className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-3">
                      No pending requests
                    </h3>
                    <p className="text-muted-foreground">
                      When others request swaps with you, they'll appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {getFilteredRequests(user._id, "pending").map((request) => renderRequestCard(request, true))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="sent" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Send className="w-6 h-6 text-primary" />
                  Sent Requests
                </CardTitle>
                <p className="text-muted-foreground">Requests you've sent to other users</p>
              </CardHeader>
              <CardContent>
                {sentCount === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-b from-muted to-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Send className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-3">
                      No sent requests
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      You haven't sent any swap requests yet.
                    </p>
                    <Button onClick={() => router.push("/")} className="rounded-full">
                      Find Users to Connect With
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {getFilteredRequests(user._id, "sent").map((request) => renderRequestCard(request, false))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="accepted" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <CheckCircle className="w-6 h-6 text-primary" />
                  Accepted Swaps
                </CardTitle>
                <p className="text-muted-foreground">Successful skill swap connections ready to coordinate</p>
              </CardHeader>
              <CardContent>
                {acceptedCount === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-b from-muted to-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-3">
                      No accepted swaps
                    </h3>
                    <p className="text-muted-foreground">
                      When you accept a swap request, it will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {getFilteredRequests(user._id, "accepted").map((request) => renderRequestCard(request, false))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="rejected" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <XCircle className="w-6 h-6 text-destructive" />
                  Rejected Requests
                </CardTitle>
                <p className="text-muted-foreground">Requests you've rejected or were rejected by others</p>
              </CardHeader>
              <CardContent>
                {rejectedCount === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-b from-muted to-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <XCircle className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-3">
                      No rejected requests
                    </h3>
                    <p className="text-muted-foreground">
                      When you reject a swap request, it will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {getFilteredRequests(user._id, "rejected").map((request) => renderRequestCard(request, false))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <ChatModal chatUser={chatUser} chatOpen={chatOpen} setChatOpen={setChatOpen} />
      </div>
    </div>
  )
}
