import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Get search parameters
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('query') || '';
    const availability = searchParams.get('availability') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6');

    // Get current user ID from token
    let currentUserId = null;
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        currentUserId = decoded.userId;
      } catch (error) {
        console.error('Token verification error:', error);
      }
    }

    // Build MongoDB query
    const mongoQuery: any = {
      visibility: 'Public',
    };

    if (currentUserId) {
      mongoQuery._id = { $ne: currentUserId }; // Exclude current user
    }

    if (query) {
      mongoQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { skillsOffered: { $regex: query, $options: 'i' } },
        { skillsWanted: { $regex: query, $options: 'i' } },
      ];
    }

    if (availability !== 'all') {
      mongoQuery.availability = availability;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await User.countDocuments(mongoQuery);

    // Get users with pagination
    const users = await User.find(mongoQuery)
      .select('-password') // Exclude password
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Search users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
