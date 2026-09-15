import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await prisma.workoutSession.findMany({
      where: {
        userId: sessionUser.userId,
        status: "COMPLETED",
      },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: { orderBy: { setNumber: "asc" } },
          },
          orderBy: { orderIndex: "asc" },
        },
      },
      orderBy: { completedAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("GET workout history error:", error);
    return NextResponse.json(
      { error: "Could not fetch workout history." },
      { status: 500 }
    );
  }
}
