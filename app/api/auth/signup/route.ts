import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: Request) {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { name, email, password } = body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data and token
    return NextResponse.json({
      token,
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
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
