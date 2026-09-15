import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DIFFICULTY_XP } from "@/lib/services/rpgEngine";

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoryFilter = searchParams.get("category");
    const todayStr = new Date().toISOString().split("T")[0];

    const whereCondition: any = {
      userId: sessionUser.userId,
      isArchived: false,
    };

    if (categoryFilter && categoryFilter !== "ALL") {
      whereCondition.category = {
        equals: categoryFilter,
      };
    }

    const tasks = await prisma.task.findMany({
      where: whereCondition,
      orderBy: { createdAt: "asc" },
    });

    const completions = await prisma.taskCompletion.findMany({
      where: {
        userId: sessionUser.userId,
        date: todayStr,
      },
    });

    const completedIds = new Set(completions.map((c) => c.taskId));

    const quests = tasks.map((t) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      difficulty: t.difficulty,
      xpReward: t.xpReward,
      scheduleType: t.scheduleType,
      dueDate: t.dueDate,
      isCompleted: completedIds.has(t.id),
      createdAt: t.createdAt,
    }));

    return NextResponse.json({ quests });
  } catch (error) {
    console.error("GET quests error:", error);
    return NextResponse.json(
      { error: "Could not fetch quests." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, category, difficulty, customXp, scheduleType, dueDate } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Quest name is required." }, { status: 400 });
    }

    const diffKey = (difficulty || "MEDIUM").toUpperCase();
    const defaultXp = DIFFICULTY_XP[diffKey] || 25;
    
    let xpReward = defaultXp;
    if (customXp !== undefined && customXp !== null && customXp !== "") {
      const parsed = parseInt(String(customXp), 10);
      if (!isNaN(parsed) && parsed > 0) {
        xpReward = parsed;
      }
    }

    const quest = await prisma.task.create({
      data: {
        userId: sessionUser.userId,
        name: name.trim(),
        category: category || "Discipline",
        difficulty: diffKey,
        xpReward: Math.max(1, xpReward),
        scheduleType: scheduleType || "DAILY",
        dueDate: dueDate || null,
      },
    });

    return NextResponse.json({ success: true, quest }, { status: 201 });
  } catch (error) {
    console.error("POST quest error:", error);
    return NextResponse.json(
      { error: "Could not create quest." },
      { status: 500 }
    );
  }
}
