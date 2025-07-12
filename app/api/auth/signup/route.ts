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

    console.log('Creating response with user:', { 
      id: user._id, 
      email: user.email, 
      token: token ? 'exists' : 'missing' 
    });

    // Return user data with token included in the user object
    const response = {
      user: {
        _id: user._id.toString(), // Convert ObjectId to string
        name: user.name,
        email: user.email,
        token, // Include token in user object
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
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
