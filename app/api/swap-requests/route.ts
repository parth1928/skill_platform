import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { verifyJwt } from "@/lib/jwt"
import { ObjectId } from "mongodb"

// Create a new swap request
export async function POST(request: Request) {
  try {
    const db = await connectToDatabase()
    const body = await request.json()

    // Get authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Verify JWT token
    const token = authHeader.split(" ")[1]
    const decoded = await verifyJwt(token)
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      )
    }

    // Validate input
    const { toUserId, offeredSkill, requestedSkill, message } = body
    if (!toUserId || !offeredSkill || !requestedSkill) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate ObjectIds
    if (!ObjectId.isValid(toUserId) || !ObjectId.isValid(decoded.userId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      )
    }

    // Check if users exist
    const [fromUser, toUser] = await Promise.all([
      db.collection("users").findOne({ _id: new ObjectId(decoded.userId) }),
      db.collection("users").findOne({ _id: new ObjectId(toUserId) })
    ])

    if (!fromUser || !toUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check if user is trying to request themselves
    if (toUserId === decoded.userId) {
      return NextResponse.json(
        { error: "Cannot request swap with yourself" },
        { status: 400 }
      )
    }

    // Check for existing pending request
    const existingRequest = await db.collection("swapRequests").findOne({
      fromUserId: new ObjectId(decoded.userId),
      toUserId: new ObjectId(toUserId),
      status: "Pending"
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: "A pending request already exists with this user" },
        { status: 400 }
      )
    }

    // Create swap request
    const swapRequest = {
      fromUserId: new ObjectId(decoded.userId),
      toUserId: new ObjectId(toUserId),
      offeredSkill,
      requestedSkill,
      message: message || "",
      status: "Pending",
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection("swapRequests").insertOne(swapRequest)

    return NextResponse.json({
      message: "Swap request created successfully",
      requestId: result.insertedId
    })
  } catch (error) {
    console.error("Error creating swap request:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Get all swap requests for a user
export async function GET(request: Request) {
  try {
    const db = await connectToDatabase()

    // Get authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Verify JWT token
    const token = authHeader.split(" ")[1]
    const decoded = await verifyJwt(token)
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      )
    }

    // Get requests where user is either sender or receiver
    const requests = await db.collection("swapRequests")
      .aggregate([
        {
          $match: {
            $or: [
              { fromUserId: new ObjectId(decoded.userId) },
              { toUserId: new ObjectId(decoded.userId) }
            ]
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "fromUserId",
            foreignField: "_id",
            as: "fromUser"
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "toUserId",
            foreignField: "_id",
            as: "toUser"
          }
        },
        {
          $unwind: "$fromUser"
        },
        {
          $unwind: "$toUser"
        },
        {
          $project: {
            fromUser: {
              _id: 1,
              name: 1,
              profilePic: 1
            },
            toUser: {
              _id: 1,
              name: 1,
              profilePic: 1
            },
            offeredSkill: 1,
            requestedSkill: 1,
            message: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1
          }
        },
        {
          $sort: { createdAt: -1 }
        }
      ])
      .toArray()

    return NextResponse.json({ requests })
  } catch (error) {
    console.error("Error fetching swap requests:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
