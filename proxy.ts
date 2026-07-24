import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
    const sessionCookie = getSessionCookie(request);
    const { pathname } = request.nextUrl;

    const isAuthRoute = pathname.startsWith("/auth");

    if (isAuthRoute) {
        if (sessionCookie) {
            return NextResponse.redirect(new URL("/blog", request.url));
        }
        return NextResponse.next();
    }

    if (!sessionCookie) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/blog/:path*", "/create/:path*", "/auth/:path*"],
};
