"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, CheckCircle, XCircle, Send, Inbox, ThumbsUp, ThumbsDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useSwapRequests } from "@/hooks/use-swap-requests"

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { requests, acceptRequest, rejectRequest, getFilteredRequests } = useSwapRequests()

  const [activeTab, setActiveTab] = useState("pending")

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  const handleAcceptRequest = (requestId: string) => {
    acceptRequest(requestId)
    toast({
      title: "Request accepted! 🎉",
      description: "The swap request has been accepted successfully. You can now coordinate with the other user!",
    })
  }

  const handleRejectRequest = (requestId: string) => {
    rejectRequest(requestId)
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
    const isIncoming = request.toUserId === user.uid
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
      <Card key={request.id} className="hover:shadow-2xl hover:shadow-primary/5 transition-all duration-200">
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

              <p className="text-xs text-gray-500 mb-3">{formatDate(request.timestamp)}</p>

              {showActions && request.status === "Pending" && isIncoming && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleAcceptRequest(request.id)}
                    className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 rounded-full"
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleRejectRequest(request.id)}
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
                    <Button className="rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70">
                      Contact {otherUser.name}
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
  const pendingCount = getFilteredRequests(user.uid, "pending").length
  const sentCount = getFilteredRequests(user.uid, "sent").length
  const acceptedCount = getFilteredRequests(user.uid, "accepted").length
  const rejectedCount = getFilteredRequests(user.uid, "rejected").length

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container py-20">
        <div className="mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-3">
            Swap Requests Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your skill swap requests and connections
          </p>
        </div>

        <div className="relative mb-16">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)]" />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
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
                    <Inbox className="w-6 h-6 text-primary" />
                    Incoming Requests
                  </CardTitle>
                  <p className="text-muted-foreground">Requests from other users waiting for your response</p>
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
                      {getFilteredRequests(user.uid, "pending").map((request) => renderRequestCard(request, true))}
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
                      {getFilteredRequests(user.uid, "sent").map((request) => renderRequestCard(request, false))}
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
                        No accepted swaps yet
                      </h3>
                      <p className="text-muted-foreground">
                        Accepted swaps will appear here for coordination.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {getFilteredRequests(user.uid, "accepted").map((request) => renderRequestCard(request, false))}
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
                  <p className="text-muted-foreground">Requests that were declined</p>
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
                        Rejected requests will appear here for reference.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {getFilteredRequests(user.uid, "rejected").map((request) => renderRequestCard(request, false))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
