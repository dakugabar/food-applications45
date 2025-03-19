import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const adminId = request.cookies.get("adminId")?.value || "";

    // Handle unauthenticated access to protected pages
    if (!adminId && (request.nextUrl.pathname.startsWith('/AdminPanel') || request.nextUrl.pathname.startsWith('/Table-Order'))) {
        const loginUrl = new URL('/login', request.url);
        // Add the current pathname as the redirect parameter
        loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Handle authenticated users trying to access the login page
    if (adminId && request.nextUrl.pathname === '/login') {
        // Get the redirect parameter or fallback to the homepage
        const redirectUrl = request.nextUrl.searchParams.get('redirect' ) || '/AdminPanel';
        return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    return NextResponse.next(); // Allow access to other pages
}

// Matching paths for AdminPanel, Table-Order, and login page
export const config = {
    matcher: ['/AdminPanel/:path*', '/Table-Order/:path*', '/login'],
};
