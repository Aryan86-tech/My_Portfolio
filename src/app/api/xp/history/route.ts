import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transactions = await prisma.xPTransaction.findMany({
      where: { userId: sessionUser.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("GET XP history error:", error);
    return NextResponse.json(
      { error: "Could not fetch XP history." },
      { status: 500 }
    );
  }
}
