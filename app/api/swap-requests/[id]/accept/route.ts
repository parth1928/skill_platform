import { NextResponse } from "next/server"
import { verifyJwt } from "@/lib/jwt"
import { connectToDatabase } from "@/lib/mongodb"
import SwapRequest from "@/lib/db/models/SwapRequest"
import { cookies } from "next/headers"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await verifyJwt(token)
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    await connectToDatabase()

    const swapRequest = await SwapRequest.findById(params.id)
    if (!swapRequest) {
      return NextResponse.json({ error: "Swap request not found" }, { status: 404 })
    }

    // Only allow the receiver of the request to accept it
    if (swapRequest.toUserId.toString() !== payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only allow accepting pending requests
    if (swapRequest.status !== "Pending") {
      return NextResponse.json(
        { error: "Can only accept pending requests" },
        { status: 400 }
      )
    }

    swapRequest.status = "Accepted"
    await swapRequest.save()

    return NextResponse.json({ message: "Request accepted successfully" })
  } catch (error) {
    console.error("Error accepting swap request:", error)
    return NextResponse.json(
      { error: "Failed to accept swap request" },
      { status: 500 }
    )
  }
}
