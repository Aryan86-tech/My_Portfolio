import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const todayStr = new Date().toISOString().split("T")[0];

    // Fetch user's active tasks
    const tasks = await prisma.task.findMany({
      where: {
        userId: sessionUser.userId,
        isArchived: false,
      },
      orderBy: { createdAt: "asc" },
    });

    // Fetch today's task completions
    const completions = await prisma.taskCompletion.findMany({
      where: {
        userId: sessionUser.userId,
        date: todayStr,
      },
    });

    const completedTaskIds = new Set(completions.map((c) => c.taskId));

    const quests = tasks.map((t) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      difficulty: t.difficulty,
      xpReward: t.xpReward,
      scheduleType: t.scheduleType,
      isCompleted: completedTaskIds.has(t.id),
    }));

    // Fetch today's water log
    const waterLog = await prisma.waterLog.findUnique({
      where: {
        userId_date: {
          userId: sessionUser.userId,
          date: todayStr,
        },
      },
    });

    // Fetch today's nutrition log
    const nutritionLog = await prisma.nutritionLog.findUnique({
      where: {
        userId_date: {
          userId: sessionUser.userId,
          date: todayStr,
        },
      },
    });

    return NextResponse.json({
      quests,
      waterMl: waterLog?.amountMl || 0,
      noSugar: nutritionLog?.noAddedSugar ?? true,
      noJunk: nutritionLog?.noJunkFood ?? true,
    });
  } catch (error) {
    console.error("Fetch today quests error:", error);
    return NextResponse.json(
      { error: "Could not fetch today's quests." },
      { status: 500 }
    );
  }
}
