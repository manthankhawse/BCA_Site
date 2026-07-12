import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ContactMessage } from '@/models/ContactMessage';

// Public endpoint — no auth required (anyone submitting the form)
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, email, phone, program, message } = body;
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email and message are required.' }, { status: 400 });
    }
    const contact = await ContactMessage.create({ name, email, phone, program, message });
    return NextResponse.json({ success: true, contact }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Admin only — fetch all messages
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const messages = await ContactMessage.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
