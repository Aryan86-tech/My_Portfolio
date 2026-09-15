import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DIFFICULTY_XP } from "@/lib/services/rpgEngine";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, category, difficulty, customXp, scheduleType, dueDate } = body;

    const existing = await prisma.task.findFirst({
      where: { id, userId: sessionUser.userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Quest not found." }, { status: 404 });
    }

    const diffKey = (difficulty || existing.difficulty).toUpperCase();
    const defaultXp = DIFFICULTY_XP[diffKey] || 25;
    
    let xpReward = existing.xpReward;
    if (customXp !== undefined && customXp !== null && customXp !== "") {
      const parsed = parseInt(String(customXp), 10);
      if (!isNaN(parsed) && parsed > 0) {
        xpReward = parsed;
      } else {
        xpReward = defaultXp;
      }
    } else if (difficulty && difficulty !== existing.difficulty) {
      xpReward = defaultXp;
    }

    const updatedQuest = await prisma.task.update({
      where: { id },
      data: {
        name: name ? name.trim() : existing.name,
        category: category || existing.category,
        difficulty: diffKey,
        xpReward: Math.max(1, xpReward),
        scheduleType: scheduleType || existing.scheduleType,
        dueDate: dueDate !== undefined ? dueDate : existing.dueDate,
      },
    });

    return NextResponse.json({ success: true, quest: updatedQuest });
  } catch (error) {
    console.error("PUT quest error:", error);
    return NextResponse.json(
      { error: "Could not update quest." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.task.findFirst({
      where: { id, userId: sessionUser.userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Quest not found." }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Quest deleted." });
  } catch (error) {
    console.error("DELETE quest error:", error);
    return NextResponse.json(
      { error: "Could not delete quest." },
      { status: 500 }
    );
  }
}
