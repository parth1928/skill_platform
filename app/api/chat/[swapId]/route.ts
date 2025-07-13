import { NextResponse } from "next/server"
import { verifyJwt } from "@/lib/jwt"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Get chat messages for a swap request
export async function GET(req: Request, { params }: { params: { swapId: string } }) {
  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const payload = await verifyJwt(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const db = await connectToDatabase()
    
    // Await params to extract swapId
    const { swapId } = await params
    // Verify swap request exists and user is a participant
    const swapRequest = await db.collection("swapRequests").findOne({
      _id: new ObjectId(swapId),
      $or: [
        { fromUserId: new ObjectId(payload.userId) },
        { toUserId: new ObjectId(payload.userId) }
      ]
    })

    if (!swapRequest) {
      return NextResponse.json({ error: "Swap request not found or unauthorized" }, { status: 404 })
    }

    // Get or create chat
    let chat = await db.collection("chats").findOne({
      swapRequestId: new ObjectId(swapId)
    })

    if (!chat) {
      // Create new chat
      const result = await db.collection("chats").insertOne({
        swapRequestId: new ObjectId(swapId),
        messages: [],
        participants: [new ObjectId(swapRequest.fromUserId), new ObjectId(swapRequest.toUserId)],
        lastMessageAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      })
      chat = await db.collection("chats").findOne({ _id: result.insertedId })
    }

    return NextResponse.json({ chat })
  } catch (error) {
    console.error("Error fetching chat:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Send a new message
export async function POST(req: Request, { params }: { params: { swapId: string } }) {
  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const payload = await verifyJwt(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { message } = await req.json()
    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const db = await connectToDatabase()
    
    // Await params to extract swapId
    const { swapId } = await params

    // Verify swap request exists and user is a participant
    const swapRequest = await db.collection("swapRequests").findOne({
      _id: new ObjectId(swapId),
      $or: [
        { fromUserId: new ObjectId(payload.userId) },
        { toUserId: new ObjectId(payload.userId) }
      ]
    })

    if (!swapRequest) {
      return NextResponse.json({ error: "Swap request not found or unauthorized" }, { status: 404 })
    }

    // Get sender's name
    const sender = await db.collection("users").findOne({
      _id: new ObjectId(payload.userId)
    })

    if (!sender) {
      return NextResponse.json({ error: "Sender not found" }, { status: 404 })
    }

    const newMessage: {
      senderId: ObjectId;
      senderName: string;
      content: string;
      timestamp: Date;
    } = {
      senderId: new ObjectId(payload.userId),
      senderName: sender.name as string, // Ensure this is a string
      content: message.trim(),
      timestamp: new Date()
    }

    // Update or create chat
    await db.collection("chats").updateOne(
      { swapRequestId: new ObjectId(swapId) },
      ({
        "$push": { messages: { $each: [newMessage] } },
        "$set": { lastMessageAt: new Date(), updatedAt: new Date() },
        "$setOnInsert": {
          participants: [new ObjectId(swapRequest.fromUserId), new ObjectId(swapRequest.toUserId)],
          createdAt: new Date()
        }
      } as any),
      { upsert: true }
    )

    return NextResponse.json({ message: newMessage })
  } catch (error) {
    console.error("Error sending message:", JSON.stringify(error, null, 2))
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
