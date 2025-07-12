import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { verifyJwt } from "@/lib/jwt"
import { ObjectId } from "mongodb"

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    console.log("Fetching user with ID:", id);
    const db = await connectToDatabase()

    // Validate object ID
    if (!ObjectId.isValid(id)) {
      console.log("Invalid ObjectId format:", id);
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      )
    }

    // Find user by _id
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(id) },
      {
        projection: {
          name: 1,
          profilePic: 1,
          location: 1,
          skillsOffered: 1,
          skillsWanted: 1,
          availability: 1,
          visibility: 1,
          rating: 1,
          createdAt: 1,
          updatedAt: 1,
          _id: 1,
        }
      }
    )

    if (!user) {
      console.log("User not found");
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    console.log("User found:", user._id);
    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
