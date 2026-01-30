import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Define protected routes pattern
    const isProtectedRoute =
        path === "/" ||
        path.startsWith("/miniapp/admin") ||
        path.startsWith("/stats");

    if (isProtectedRoute) {
        const cookie = request.cookies.get("admin_session");

        if (!cookie) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        const session = await decrypt(cookie.value);

        if (!session) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        // Add user info to headers if needed, or just allow
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    // Matcher for protected routes. 
    // Note: We match more broadly here to ensure we catch everything, 
    // but the logic inside filters specifically. 
    // Alternatively, we can just match the protected routes directly.
    matcher: [
        "/",
        "/miniapp/admin/:path*",
        "/stats/:path*"
    ],
};
