import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function updateProfile(req: NextRequest) {
  try {
    await dbConnect();

    // Get token from header
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    const body = await req.json();
    const {
      name,
      location,
      skillsOffered,
      skillsWanted,
      availability,
      visibility,
      profilePic,
    } = body;

    // Update user
    const user = await User.findByIdAndUpdate(
      decoded.userId,
      {
        ...(name && { name }),
        ...(location && { location }),
        ...(skillsOffered && { skillsOffered }),
        ...(skillsWanted && { skillsWanted }),
        ...(availability && { availability }),
        ...(visibility && { visibility }),
        ...(profilePic && { profilePic }),
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return updated user data
    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        location: user.location,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        availability: user.availability,
        visibility: user.visibility,
        rating: user.rating,
      },
    });
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
