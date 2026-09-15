import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkLevelUp } from "@/lib/services/rpgEngine";

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await request.json();
    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required." }, { status: 400 });
    }

    const todayStr = new Date().toISOString().split("T")[0];

    const task = await prisma.task.findFirst({
      where: { id: taskId, userId: sessionUser.userId },
    });

    if (!task) {
      return NextResponse.json({ error: "Quest not found." }, { status: 404 });
    }

    // Get current profile XP before change
    const profile = await prisma.profile.findUnique({
      where: { userId: sessionUser.userId },
    });

    const oldXp = profile?.totalXp || 0;

    // Check if completion record exists for today
    const existingCompletion = await prisma.taskCompletion.findUnique({
      where: {
        userId_taskId_date: {
          userId: sessionUser.userId,
          taskId: task.id,
          date: todayStr,
        },
      },
    });

    let xpEarned = 0;
    let newXp = oldXp;

    if (existingCompletion) {
      // Toggle off / remove completion
      await prisma.taskCompletion.delete({
        where: { id: existingCompletion.id },
      });

      // Deduct XP transaction
      await prisma.xPTransaction.create({
        data: {
          userId: sessionUser.userId,
          amount: -task.xpReward,
          source: "TASK",
          description: `Unchecked: ${task.name}`,
          referenceId: task.id,
        },
      });

      newXp = Math.max(0, oldXp - task.xpReward);

      // Update Profile total XP
      await prisma.profile.update({
        where: { userId: sessionUser.userId },
        data: {
          totalXp: newXp,
        },
      });
    } else {
      // Create completion (enforcing single completion per date)
      await prisma.taskCompletion.create({
        data: {
          userId: sessionUser.userId,
          taskId: task.id,
          date: todayStr,
          xpEarned: task.xpReward,
        },
      });

      // Record XP transaction
      await prisma.xPTransaction.create({
        data: {
          userId: sessionUser.userId,
          amount: task.xpReward,
          source: "TASK",
          description: `Completed Quest: ${task.name}`,
          referenceId: task.id,
        },
      });

      newXp = oldXp + task.xpReward;
      xpEarned = task.xpReward;

      // Increment Profile total XP & update streak
      await prisma.profile.update({
        where: { userId: sessionUser.userId },
        data: {
          totalXp: newXp,
          currentStreak: { increment: 1 },
        },
      });
    }

    const levelUpData = checkLevelUp(oldXp, newXp);

    return NextResponse.json({
      success: true,
      completed: !existingCompletion,
      xpEarned,
      newXp,
      levelUpData,
    });
  } catch (error) {
    console.error("Toggle quest error:", error);
    return NextResponse.json(
      { error: "Could not update quest status." },
      { status: 500 }
    );
  }
}
