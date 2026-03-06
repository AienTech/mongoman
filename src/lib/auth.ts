import { cookies } from 'next/headers';
import crypto from 'crypto';

export const AUTH_COOKIE_NAME = 'mongoman-session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export type UserRole = 'admin' | 'readOnly';

export interface SessionPayload {
  username: string;
  role: UserRole;
  expiresAt: number;
}

export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET || process.env.MONGODB_URI;
  if (!secret) {
    throw new Error(
      'AUTH_SECRET or MONGODB_URI must be set when authentication is enabled. ' +
        'Set AUTH_SECRET in your environment variables.',
    );
  }
  return crypto.createHash('sha256').update(secret).digest('hex');
}

function sign(payload: string): string {
  const secret = getAuthSecret();
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  return hmac.digest('hex');
}

function createToken(payload: SessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = sign(data);
  return `${data}.${signature}`;
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    const [data, signature] = token.split('.');
    if (!data || !signature) return null;
    const expected = sign(data);
    const sigBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expected, 'hex');
    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return null;
    }
    const payload: SessionPayload = JSON.parse(Buffer.from(data, 'base64').toString());
    if (Date.now() > payload.expiresAt) return null;
    return payload;
  } catch {
    return null;
  }
}

export function isAuthEnabled(): boolean {
  return !!process.env.MONGOMAN_USERNAME;
}

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function authenticate(username: string, password: string): Promise<SessionPayload | null> {
  const adminUser = process.env.MONGOMAN_USERNAME;
  const adminPass = process.env.MONGOMAN_PASSWORD;
  const readOnlyUser = process.env.MONGOMAN_READONLY_USERNAME;
  const readOnlyPass = process.env.MONGOMAN_READONLY_PASSWORD;

  if (adminUser && adminPass && safeCompare(username, adminUser) && safeCompare(password, adminPass)) {
    return { username, role: 'admin', expiresAt: Date.now() + SESSION_DURATION };
  }

  if (
    readOnlyUser &&
    readOnlyPass &&
    safeCompare(username, readOnlyUser) &&
    safeCompare(password, readOnlyPass)
  ) {
    return { username, role: 'readOnly', expiresAt: Date.now() + SESSION_DURATION };
  }

  return null;
}

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = createToken(payload);
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
