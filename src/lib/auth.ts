import { NextRequest } from 'next/server';

export const runtime = "nodejs";

export function getBasicAuthCredentials(request: NextRequest): { username: string; password: string } | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return null;
  }

  try {
    const base64Credentials = authHeader.substring(6);
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');
    
    return { username, password };
  } catch {
    return null;
  }
}

export function validateBasicAuth(request: NextRequest): boolean {
  const credentials = getBasicAuthCredentials(request);
  
  if (!credentials) {
    return false;
  }

  const expectedUsername = process.env.ADMIN_USER;
  const expectedPassword = process.env.ADMIN_PASS;

  if (!expectedUsername || !expectedPassword) {
    console.error('ADMIN_USER et ADMIN_PASS doivent être définis dans .env.local');
    return false;
  }

  return credentials.username === expectedUsername && credentials.password === expectedPassword;
}

export function createBasicAuthResponse(): Response {
  return new Response('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Admin Access"',
      'Content-Type': 'text/plain',
    },
  });
} 