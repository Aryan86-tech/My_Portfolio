import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const monthParam = searchParams.get("month") || new Date().toISOString().slice(0, 7); // YYYY-MM

    // If date requested, resolve full Day Summary
    if (dateParam) {
      const targetDate = dateParam;

      const dailyScore = await prisma.dailyScore.findUnique({
        where: { userId_date: { userId: sessionUser.userId, date: targetDate } },
      });

      const xpTxList = await prisma.xPTransaction.findMany({
        where: {
          userId: sessionUser.userId,
          createdAt: {
            gte: new Date(targetDate + "T00:00:00"),
            lte: new Date(targetDate + "T23:59:59"),
          },
        },
      });

      const dayTotalXp = xpTxList.reduce((acc, tx) => acc + tx.amount, 0);

      const taskCompletions = await prisma.taskCompletion.findMany({
        where: { userId: sessionUser.userId, date: targetDate },
        include: { task: true },
      });

      const workoutSession = await prisma.workoutSession.findFirst({
        where: {
          userId: sessionUser.userId,
          status: "COMPLETED",
          completedAt: {
            gte: new Date(targetDate + "T00:00:00"),
            lte: new Date(targetDate + "T23:59:59"),
          },
        },
        include: {
          exercises: {
            include: { exercise: true, sets: true },
          },
        },
      });

      const nutritionLog = await prisma.nutritionLog.findUnique({
        where: { userId_date: { userId: sessionUser.userId, date: targetDate } },
      });

      const waterLog = await prisma.waterLog.findUnique({
        where: { userId_date: { userId: sessionUser.userId, date: targetDate } },
      });

      const weightLog = await prisma.bodyMeasurement.findFirst({
        where: { userId: sessionUser.userId, date: targetDate },
      });

      return NextResponse.json({
        date: targetDate,
        dailyScore: dailyScore?.score || null,
        totalXp: dayTotalXp,
        questsCompleted: taskCompletions.map((tc) => ({ id: tc.task.id, name: tc.task.name, category: tc.task.category, xp: tc.xpEarned })),
        workout: workoutSession
          ? {
              name: workoutSession.name,
              durationSeconds: workoutSession.durationSeconds,
              totalVolume: workoutSession.totalVolume,
              totalSets: workoutSession.totalSets,
              totalReps: workoutSession.totalReps,
              exercises: workoutSession.exercises.map((se) => ({
                name: se.exerciseNameSnapshot || se.exercise.name,
                setsCount: se.sets.length,
              })),
            }
          : null,
        nutrition: nutritionLog
          ? {
              noAddedSugar: nutritionLog.noAddedSugar,
              noJunkFood: nutritionLog.noJunkFood,
              processedFoodStatus: nutritionLog.processedFoodStatus,
              proteinGrams: nutritionLog.protein || 0,
            }
          : null,
        waterMl: waterLog?.amountMl || 0,
        weight: weightLog?.weight || null,
      });
    }

    // Resolve Month Calendar Badges & Activity Heatmap
    const dailyScores = await prisma.dailyScore.findMany({
      where: {
        userId: sessionUser.userId,
        date: { startsWith: monthParam },
      },
    });

    const workoutSessions = await prisma.workoutSession.findMany({
      where: {
        userId: sessionUser.userId,
        status: "COMPLETED",
      },
      select: { completedAt: true },
    });

    const nutritionLogs = await prisma.nutritionLog.findMany({
      where: {
        userId: sessionUser.userId,
        date: { startsWith: monthParam },
      },
    });

    // Map days in month
    const daysMap: Record<string, any> = {};
    for (const scoreItem of dailyScores) {
      daysMap[scoreItem.date] = {
        score: scoreItem.score,
        hasWorkout: false,
        noJunk: false,
      };
    }

    for (const w of workoutSessions) {
      if (w.completedAt) {
        const dStr = w.completedAt.toISOString().split("T")[0];
        if (!daysMap[dStr]) daysMap[dStr] = { score: 80, hasWorkout: true, noJunk: true };
        else daysMap[dStr].hasWorkout = true;
      }
    }

    for (const n of nutritionLogs) {
      if (!daysMap[n.date]) daysMap[n.date] = { score: n.nutritionScore, hasWorkout: false, noJunk: n.noJunkFood };
      else daysMap[n.date].noJunk = n.noJunkFood;
    }

    return NextResponse.json({
      month: monthParam,
      daysMap,
    });
  } catch (error) {
    console.error("GET calendar error:", error);
    return NextResponse.json({ error: "Could not fetch calendar data." }, { status: 500 });
  }
}
