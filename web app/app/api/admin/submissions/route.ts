import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';
const ADMIN_KEY = process.env.ADMIN_API_KEY || '';

export async function GET(request: NextRequest) {
  if (!ADMIN_KEY) {
    return NextResponse.json({ success: false, error: 'Admin API key not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  try {
    const url = status ? `${API_URL}/admin/submissions?status=${status}` : `${API_URL}/admin/submissions`;
    const res = await fetch(url, {
      headers: {
        'X-API-Key': API_KEY,
        'X-Admin-Key': ADMIN_KEY,
      },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Admin submissions API error:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch submissions' }, { status: 500 });
  }
}
