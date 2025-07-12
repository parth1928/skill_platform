import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import User from "@/lib/db/models/User"
import mongoose from "mongoose"

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const params = await Promise.resolve(context.params);
    const id = params.id;
    console.log("[API] Fetching user with ID:", id);
    
    // Connect to DB
    const db = await connectToDatabase();
    await mongoose.connect(process.env.MONGODB_URI!);

    // Log the request details
    console.log("[API] Request details:", {
      id,
      isValidObjectId: mongoose.isValidObjectId(id),
      headers: Object.fromEntries(request.headers),
    });

    // First try to find user with Mongoose
    console.log("[API] Attempting Mongoose findById");
    const userFromMongoose = await User.findById(id)
      .select('name profilePic location skillsOffered skillsWanted availability visibility rating createdAt updatedAt')
      .lean();
    
    if (userFromMongoose) {
      console.log("[API] Found user with Mongoose");
      return new NextResponse(
        JSON.stringify({ user: userFromMongoose }), 
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log("[API] User not found with Mongoose, trying native MongoDB");

    // If not found with Mongoose, try native MongoDB
    if (ObjectId.isValid(id)) {
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
      );
      
      if (user) {
        console.log("[API] Found user with MongoDB:", user._id);
        return new NextResponse(
          JSON.stringify({ user }), 
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // For debugging - get a sample user ID
    const sampleUser = await db.collection("users").findOne({});
    if (sampleUser) {
      console.log("[API] Sample user for reference:", {
        sampleId: sampleUser._id,
        sampleIdType: typeof sampleUser._id,
        sampleIdToString: sampleUser._id.toString(),
        requestedIdEquals: ObjectId.isValid(id) ? sampleUser._id.equals(new ObjectId(id)) : false
      });
    }

    console.log("[API] User not found with either method");
    return new NextResponse(
      JSON.stringify({ error: "User not found" }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error("[API] Error details:", {
      error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
    });
    return new NextResponse(
      JSON.stringify({ 
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
