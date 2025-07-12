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
    const search = searchParams.get('search') || '';
    const availability = searchParams.get('availability') || 'all';

    // Build query
    const query: any = {
      visibility: 'Public',
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { skillsOffered: { $regex: search, $options: 'i' } },
        { skillsWanted: { $regex: search, $options: 'i' } },
      ];
    }

    if (availability !== 'all') {
      query.availability = availability;
    }

    // Get current user ID from token if available
    let currentUserId = null;
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        currentUserId = decoded.userId;
        // Exclude current user from results
        query._id = { $ne: currentUserId };
      } catch (error) {
        // Invalid token, continue without user context
      }
    }

    // Get users
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
