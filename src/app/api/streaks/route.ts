import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: sessionUser.userId },
    });

    const dailyScores = await prisma.dailyScore.findMany({
      where: { userId: sessionUser.userId },
      orderBy: { date: "desc" },
      take: 30,
    });

    const daysData = dailyScores.map((s) => ({
      date: s.date,
      score: s.score,
    }));

    return NextResponse.json({
      currentStreak: profile?.currentStreak || 0,
      longestStreak: profile?.longestStreak || 0,
      daysData,
    });
  } catch (error) {
    console.error("GET streaks error:", error);
    return NextResponse.json(
      { error: "Could not fetch streak data." },
      { status: 500 }
    );
  }
}
