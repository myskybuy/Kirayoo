import { NextResponse, type NextRequest } from 'next/server';

// Passes the path to server layouts (header variant, login "next" param).
// Auth itself is checked in layouts/pages/actions against the DB session.
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set('x-pathname', request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|design|demo|uploads|app.css|favicon.ico).*)'],
};
