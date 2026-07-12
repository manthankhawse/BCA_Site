import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Review } from '@/models/Review';
import { getSessionFromRequest } from '@/lib/auth';

// Public GET — returns all reviews
export async function GET() {
  try {
    await connectDB();
    const reviews = await Review.find({}).sort({ order: 1, createdAt: 1 });
    return NextResponse.json({ reviews });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Admin POST — add a review
export async function POST(req: NextRequest) {
  try {
    const payload = await getSessionFromRequest(req);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await connectDB();
    const body = await req.json();
    const review = await Review.create(body);
    return NextResponse.json({ review }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
