import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // 1. Check if trying to access protected routes without token
    if (!token) {
        if (pathname.startsWith('/admin') || pathname.startsWith('/user')) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }



    if (token && pathname.startsWith('/admin')) {
        try {
            // Simple base64 decode of the payload part of the JWT
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const payload = JSON.parse(jsonPayload);

            if (payload.role !== 'admin') {
                // If logged in but not admin, redirect to dashboard or home
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }

        } catch (e) {
            // If parsing fails, ignore or redirect
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/user/:path*'],
}
