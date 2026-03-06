import { NextResponse } from 'next/server';
import { authenticate, createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const session = await authenticate(username, password);

    if (!session) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    await createSession(session);
    return NextResponse.json({ success: true, role: session.role });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
