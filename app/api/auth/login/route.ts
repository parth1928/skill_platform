import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: Request) {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { email, password } = body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

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
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
