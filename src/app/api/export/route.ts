import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.userId },
      include: {
        profile: true,
        winterArcs: true,
        tasks: true,
        workoutSessions: {
          include: { exercises: { include: { sets: true } } },
        },
        bodyMeasurements: true,
        waterLogs: true,
        nutritionLogs: true,
        foodLogs: true,
        xpTransactions: true,
        userAchievements: { include: { achievement: true } },
        prRecords: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Exclude password hash from export
    const { passwordHash, ...userData } = user;

    return new Response(JSON.stringify(userData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="winter_arc_export_${user.username}_${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("GET export error:", error);
    return NextResponse.json({ error: "Could not export user data." }, { status: 500 });
  }
}
