import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export const AUTH_COOKIE_NAME = "winter_arc_token";
const JWT_SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "winter-arc-secret-key-disciplined-rpg-2026"
);

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signJWT(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET_KEY);
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET_KEY);
    return verified.payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyJWT(token);
  } catch {
    return null;
  }
}
