import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyJwt } from '@/lib/jwt';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: NextRequest) {
  try {
    const db = await connectToDatabase();

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
      const decoded = await verifyJwt(token);
      if (decoded) {
        currentUserId = decoded.userId;
        // Exclude current user from results
        query._id = { $ne: new ObjectId(currentUserId) };
      }
    }

    // Get users
    const users = await db.collection('users')
      .find(query)
      .project({ password: 0 })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    console.log('Found users:', users.length);
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
