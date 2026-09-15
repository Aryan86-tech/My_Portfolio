import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "winter_arc_token";
const JWT_SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "winter-arc-secret-key-disciplined-rpg-2026"
);

const PROTECTED_ROUTES = [
  "/dashboard",
  "/quests",
  "/workout",
  "/progress",
  "/profile",
  "/calendar",
  "/nutrition",
  "/body",
  "/achievements",
  "/settings",
  "/onboarding",
];

const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  let isValidToken = false;
  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET_KEY);
      isValidToken = true;
    } catch {
      isValidToken = false;
    }
  }

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtectedRoute && !isValidToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);
  if (isAuthRoute && isValidToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname === "/" && isValidToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icons|api/auth/login|api/auth/signup).*)",
  ],
};
