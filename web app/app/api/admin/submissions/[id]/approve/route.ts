import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';
const ADMIN_KEY = process.env.ADMIN_API_KEY || '';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!ADMIN_KEY) {
    return NextResponse.json({ success: false, error: 'Admin API key not configured' }, { status: 500 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const note = body.note;

  try {
    const res = await fetch(`${API_URL}/admin/submissions/${id}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
        'X-Admin-Key': ADMIN_KEY,
      },
      body: JSON.stringify({ note }),
      cache: 'no-store',
      next: { revalidate: 0 },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Admin approve API error:', err);
    return NextResponse.json({ success: false, error: 'Failed to approve submission' }, { status: 500 });
  }
}
