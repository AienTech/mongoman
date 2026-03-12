import { cookies } from 'next/headers';

export const AUTH_COOKIE_NAME = 'mongoman-session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export type UserRole = 'admin' | 'readOnly';

export interface SessionPayload {
  username: string;
  role: UserRole;
  expiresAt: number;
}

export async function getAuthSecret(): Promise<string> {
  const secret = process.env.AUTH_SECRET || process.env.MONGODB_URI;
  if (!secret) {
    throw new Error(
      'AUTH_SECRET or MONGODB_URI must be set when authentication is enabled. ' +
        'Set AUTH_SECRET in your environment variables.',
    );
  }
  const msgUint8 = new TextEncoder().encode(secret);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function sign(payload: string): Promise<string> {
  const secretStr = await getAuthSecret();
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secretStr);
  const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function createToken(payload: SessionPayload): Promise<string> {
  const data = btoa(JSON.stringify(payload));
  const signature = await sign(data);
  return `${data}.${signature}`;
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const [data, signature] = token.split('.');
    if (!data || !signature) return null;
    const expected = await sign(data);

    if (!timingSafeEqual(signature, expected)) {
      return null;
    }
    const payload: SessionPayload = JSON.parse(atob(data));
    if (Date.now() > payload.expiresAt) return null;
    return payload;
  } catch {
    return null;
  }
}

export function isAuthEnabled(): boolean {
  return !!process.env.MONGOMAN_USERNAME;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

function safeCompare(a: string, b: string): boolean {
  return timingSafeEqual(a, b);
}

export async function authenticate(username: string, password: string): Promise<SessionPayload | null> {
  const adminUser = process.env.MONGOMAN_USERNAME;
  const adminPass = process.env.MONGOMAN_PASSWORD;
  const readOnlyUser = process.env.MONGOMAN_READONLY_USERNAME;
  const readOnlyPass = process.env.MONGOMAN_READONLY_PASSWORD;

  if (adminUser && adminPass && safeCompare(username, adminUser) && safeCompare(password, adminPass)) {
    return { username, role: 'admin', expiresAt: Date.now() + SESSION_DURATION };
  }

  if (readOnlyUser && readOnlyPass && safeCompare(username, readOnlyUser) && safeCompare(password, readOnlyPass)) {
    return { username, role: 'readOnly', expiresAt: Date.now() + SESSION_DURATION };
  }

  return null;
}

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await createToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION / 1000,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  if (!isAuthEnabled()) return { username: 'anonymous', role: 'admin', expiresAt: Infinity };
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function requireAuth(requiredRole?: UserRole): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');
  if (requiredRole === 'admin' && session.role !== 'admin') throw new Error('Forbidden');
  return session;
}
