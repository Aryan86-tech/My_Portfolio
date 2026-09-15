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
    const range = searchParams.get("range") || "30D";

    const profile = await prisma.profile.findUnique({
      where: { userId: sessionUser.userId },
    });

    const activeArc = await prisma.winterArc.findFirst({
      where: { userId: sessionUser.userId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });

    // Calculate Winter Arc day & progress %
    let currentArcDay = 1;
    let totalArcDays = activeArc?.totalDays || 90;
    let daysRemaining = totalArcDays;
    let completionPercent = 0;

    if (activeArc?.startDate) {
      const startMs = new Date(activeArc.startDate).getTime();
      const nowMs = new Date().getTime();
      const diffDays = Math.max(1, Math.floor((nowMs - startMs) / (1000 * 3600 * 24)) + 1);
      currentArcDay = Math.min(totalArcDays, diffDays);
      daysRemaining = Math.max(0, totalArcDays - currentArcDay);
      completionPercent = Math.min(100, Math.round((currentArcDay / totalArcDays) * 100));
    }

    // Determine date cutoff for range filter
    const now = new Date();
    let daysCutoff = range === "7D" ? 7 : range === "30D" ? 30 : range === "90D" ? 90 : 365;
    const cutoffDate = new Date(now.getTime() - daysCutoff * 24 * 3600 * 1000).toISOString().split("T")[0];

    // Query XP Transactions
    const xpTransactions = await prisma.xPTransaction.findMany({
      where: { userId: sessionUser.userId },
      orderBy: { createdAt: "asc" },
    });

    // Query Daily Scores
    const dailyScores = await prisma.dailyScore.findMany({
      where: {
        userId: sessionUser.userId,
        date: { gte: cutoffDate },
      },
      orderBy: { date: "asc" },
    });

    // Query Workouts
    const workouts = await prisma.workoutSession.findMany({
      where: {
        userId: sessionUser.userId,
        status: "COMPLETED",
      },
      orderBy: { completedAt: "desc" },
    });

    // Query PRs
    const prRecords = await prisma.pRRecord.findMany({
      where: { userId: sessionUser.userId },
      include: { exercise: true },
      orderBy: { achievedAt: "desc" },
    });

    // Query Weight Logs
    const weightLogs = await prisma.bodyMeasurement.findMany({
      where: { userId: sessionUser.userId, weight: { not: null } },
      orderBy: { date: "asc" },
    });

    const startWeight = profile?.startingWeight || (weightLogs[0]?.weight ?? profile?.currentWeight ?? null);
    const currWeight = profile?.currentWeight || (weightLogs[weightLogs.length - 1]?.weight ?? null);
    const weightChange = startWeight && currWeight ? Math.round((currWeight - startWeight) * 10) / 10 : 0;

    // Calculate quest completion %
    const totalQuests = await prisma.task.count({ where: { userId: sessionUser.userId } });
    const questCompletions = await prisma.taskCompletion.count({ where: { userId: sessionUser.userId } });
    const questCompletionPercent = totalQuests > 0 ? Math.min(100, Math.round((questCompletions / (totalQuests * Math.max(1, currentArcDay))) * 100)) : 85;

    // Calculate nutrition consistency
    const totalNutritionLogs = await prisma.nutritionLog.count({ where: { userId: sessionUser.userId } });
    const cleanNutritionLogs = await prisma.nutritionLog.count({
      where: { userId: sessionUser.userId, noJunkFood: true, noAddedSugar: true },
    });
    const nutritionConsistencyPercent = totalNutritionLogs > 0 ? Math.round((cleanNutritionLogs / totalNutritionLogs) * 100) : 90;

    // Aggregate Daily Score statistics
    const avgScore = dailyScores.length > 0
      ? Math.round(dailyScores.reduce((acc, s) => acc + s.score, 0) / dailyScores.length)
      : 85;

    const bestScore = dailyScores.length > 0 ? Math.max(...dailyScores.map((s) => s.score)) : 100;
    const lowestScore = dailyScores.length > 0 ? Math.min(...dailyScores.map((s) => s.score)) : 70;

    // Category Breakdown averages
    const avgFitness = dailyScores.length > 0 ? Math.round(dailyScores.reduce((acc, s) => acc + s.fitnessScore, 0) / dailyScores.length) : 90;
    const avgNutrition = dailyScores.length > 0 ? Math.round(dailyScores.reduce((acc, s) => acc + s.nutritionScore, 0) / dailyScores.length) : 84;
    const avgDiscipline = dailyScores.length > 0 ? Math.round(dailyScores.reduce((acc, s) => acc + s.disciplineScore, 0) / dailyScores.length) : 88;
    const avgRecovery = dailyScores.length > 0 ? Math.round(dailyScores.reduce((acc, s) => acc + s.recoveryScore, 0) / dailyScores.length) : 80;

    // Automated Insights
    const insights: string[] = [];
    if (workouts.length > 0) {
      insights.push(`Completed ${workouts.length} workouts total during your Winter Arc.`);
    }
    if (prRecords.length > 0) {
      insights.push(`Achieved ${prRecords.length} Personal Records, leading strength progression.`);
    }
    if (weightChange < 0) {
      insights.push(`Body weight decreased by ${Math.abs(weightChange)} ${profile?.unitPreference || "kg"} toward your target.`);
    }
    if (avgScore >= 80) {
      insights.push(`Maintained an impressive ${avgScore}% average Daily Discipline Score over the selected period.`);
    }
    if (insights.length === 0) {
      insights.push("Complete more daily activities and workouts to generate personal insights.");
    }

    return NextResponse.json({
      winterArc: {
        currentArcDay,
        totalArcDays,
        daysRemaining,
        completionPercent,
        level: profile?.level || 1,
        rank: profile?.rank || "RECRUIT",
        totalXp: profile?.totalXp || 0,
        currentStreak: profile?.currentStreak || 0,
      },
      cards: {
        totalXp: profile?.totalXp || 0,
        currentStreak: profile?.currentStreak || 0,
        workoutsCount: workouts.length,
        prsCount: prRecords.length,
        questCompletionPercent,
        nutritionConsistencyPercent,
        weightChange,
        unit: profile?.unitPreference || "kg",
      },
      scores: {
        avgScore,
        bestScore,
        lowestScore,
        categoryBreakdown: {
          fitness: avgFitness,
          nutrition: avgNutrition,
          discipline: avgDiscipline,
          recovery: avgRecovery,
        },
        dailyScores,
      },
      recentPrs: prRecords.slice(0, 5),
      insights,
    });
  } catch (error) {
    console.error("GET analytics error:", error);
    return NextResponse.json({ error: "Could not fetch analytics data." }, { status: 500 });
  }
}
