import { NextResponse } from 'next/server';
import { getActiveRooms } from '@/lib/kv';

// Verify Basic Auth credentials
function verifyAuth(request: Request): boolean {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false;
  }

  const base64Credentials = authHeader.slice(6);
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');

  const expectedUsername = process.env.ADMIN_USERNAME || 'admin';
  const expectedPassword = process.env.ADMIN_PASSWORD;

  // Require password to be set
  if (!expectedPassword) {
    console.warn('[Admin] ADMIN_PASSWORD not set, denying access');
    return false;
  }

  return username === expectedUsername && password === expectedPassword;
}

// Return 401 with WWW-Authenticate header to trigger browser login prompt
function unauthorizedResponse(): NextResponse {
  return new NextResponse('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Admin Dashboard"',
    },
  });
}

export async function GET(request: Request) {
  // Check authentication
  if (!verifyAuth(request)) {
    return unauthorizedResponse();
  }

  try {
    const stats = await getActiveRooms();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('[Admin] Error fetching stats:', error);
    return NextResponse.json({ error: 'Error fetching stats' }, { status: 500 });
  }
}
