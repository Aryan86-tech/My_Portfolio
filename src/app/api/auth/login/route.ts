import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signJWT, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { emailOrUsername, password } = body;

    if (!emailOrUsername || !password) {
      return NextResponse.json(
        { error: "Email/Username and password are required." },
        { status: 400 }
      );
    }

    const input = emailOrUsername.toLowerCase().trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: input },
          { username: input },
        ],
      },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials. Please check your email/username and password." },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials. Please check your email/username and password." },
        { status: 401 }
      );
    }

    const token = await signJWT({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    const needsOnboarding = !user.profile;

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      needsOnboarding,
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
