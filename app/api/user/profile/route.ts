import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function updateProfile(req: NextRequest) {
  try {
    console.log('Profile update request received');
    await dbConnect();

    // Get token from header
    const authToken = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!authToken) {
      console.error('No authorization token found in headers');
      return NextResponse.json(
        { error: 'Unauthorized - No token in headers' },
        { status: 401 }
      );
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(authToken, JWT_SECRET) as { userId: string };
      console.log('Token verified for user:', decoded.userId);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    console.log('Update data received:', body);
    const {
      name,
      location,
      skillsOffered,
      skillsWanted,
      availability,
      visibility,
      profilePic,
    } = body;

    // Update user with all fields, allowing empty values
    const updateData = {
      name,
      location,
      skillsOffered,
      skillsWanted,
      availability,
      visibility,
      profilePic,
    };
    console.log('Attempting to update user with data:', updateData);
    
    const user = await User.findByIdAndUpdate(
      decoded.userId,
      updateData,
      { 
        new: true,
        runValidators: true // This ensures mongoose validates the update
      }
    );
    
    console.log('Updated user in database:', user);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return updated user data with token to maintain session
    const response = {
      user: {
        _id: user._id.toString(), // Convert ObjectId to string
        name: user.name,
        email: user.email,
        token: authToken, // Use the verified token
        profilePic: user.profilePic || "/placeholder.svg",
        location: user.location || "",
        skillsOffered: user.skillsOffered || [],
        skillsWanted: user.skillsWanted || [],
        availability: user.availability || "Evenings",
        visibility: user.visibility || "Private",
        rating: user.rating || 0,
        feedback: user.feedback || [],
      },
    };

    console.log('Sending response:', {
      ...response,
      user: {
        ...response.user,
        token: response.user.token ? 'exists' : 'missing'
      }
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const PUT = updateProfile;
export const PATCH = updateProfile;
