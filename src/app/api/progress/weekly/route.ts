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
    const targetDate = dateParam ? new Date(dateParam) : new Date();

    // Find Monday of current week
    const day = targetDate.getDay();
    const diffToMon = targetDate.getDate() - day + (day === 0 ? -6 : 1);
    const monDate = new Date(targetDate.setDate(diffToMon));
    const monStr = monDate.toISOString().split("T")[0];

    const sunDate = new Date(monDate);
    sunDate.setDate(sunDate.getDate() + 6);
    const sunStr = sunDate.toISOString().split("T")[0];

    // Previous week dates
    const prevMonDate = new Date(monDate);
    prevMonDate.setDate(prevMonDate.getDate() - 7);
    const prevMonStr = prevMonDate.toISOString().split("T")[0];

    const prevSunDate = new Date(prevMonDate);
    prevSunDate.setDate(prevSunDate.getDate() + 6);
    const prevSunStr = prevSunDate.toISOString().split("T")[0];

    // Query XP for current & previous week
    const thisWeekXpTx = await prisma.xPTransaction.findMany({
      where: {
        userId: sessionUser.userId,
        createdAt: { gte: new Date(monStr), lte: new Date(sunStr + "T23:59:59") },
      },
    });
    const thisWeekXp = thisWeekXpTx.reduce((acc, tx) => acc + tx.amount, 0);

    const prevWeekXpTx = await prisma.xPTransaction.findMany({
      where: {
        userId: sessionUser.userId,
        createdAt: { gte: new Date(prevMonStr), lte: new Date(prevSunStr + "T23:59:59") },
      },
    });
    const prevWeekXp = prevWeekXpTx.reduce((acc, tx) => acc + tx.amount, 0);

    const xpChangePct = prevWeekXp > 0 ? Math.round(((thisWeekXp - prevWeekXp) / prevWeekXp) * 100) : 100;

    // Query Workouts for current & previous week
    const thisWeekWorkouts = await prisma.workoutSession.count({
      where: {
        userId: sessionUser.userId,
        status: "COMPLETED",
        completedAt: { gte: new Date(monStr), lte: new Date(sunStr + "T23:59:59") },
      },
    });

    const prevWeekWorkouts = await prisma.workoutSession.count({
      where: {
        userId: sessionUser.userId,
        status: "COMPLETED",
        completedAt: { gte: new Date(prevMonStr), lte: new Date(prevSunStr + "T23:59:59") },
      },
    });

    // Query PRs
    const thisWeekPrs = await prisma.pRRecord.count({
      where: {
        userId: sessionUser.userId,
        achievedAt: { gte: new Date(monStr), lte: new Date(sunStr + "T23:59:59") },
      },
    });

    // Query Daily Scores
    const thisWeekScores = await prisma.dailyScore.findMany({
      where: {
        userId: sessionUser.userId,
        date: { gte: monStr, lte: sunStr },
      },
    });

    const avgThisWeekScore = thisWeekScores.length > 0
      ? Math.round(thisWeekScores.reduce((acc, s) => acc + s.score, 0) / thisWeekScores.length)
      : 85;

    // Query Nutrition & Water
    const noJunkDays = await prisma.nutritionLog.count({
      where: {
        userId: sessionUser.userId,
        date: { gte: monStr, lte: sunStr },
        noJunkFood: true,
      },
    });

    const profile = await prisma.profile.findUnique({ where: { userId: sessionUser.userId } });

    // Automated Wins
    const wins: string[] = [];
    if (thisWeekWorkouts >= 3) wins.push(`Completed ${thisWeekWorkouts} workouts this week.`);
    if (thisWeekPrs > 0) wins.push(`Set ${thisWeekPrs} new Personal Record${thisWeekPrs > 1 ? "s" : ""}.`);
    if (thisWeekXp > 500) wins.push(`Earned ${thisWeekXp} XP towards leveling up.`);
    if (noJunkDays >= 5) wins.push(`Maintained No Junk Food for ${noJunkDays} days.`);
    if (wins.length === 0) wins.push("Logged active participation in your Winter Arc system.");

    // Automated Areas to Improve
    const improve: string[] = [];
    if (thisWeekWorkouts < 3) improve.push("Workout consistency was lower than target (3+ recommended).");
    if (noJunkDays < 5) improve.push(`Junk food goal was kept ${noJunkDays}/7 days. Focus on clean nutrition next week.`);
    if (improve.length === 0) improve.push("Keep maintaining your momentum and solid habit routines!");

    // Query Manual Reflection
    const reflection = await prisma.weeklyReflection.findUnique({
      where: {
        userId_weekStartDate: {
          userId: sessionUser.userId,
          weekStartDate: monStr,
        },
      },
    });

    return NextResponse.json({
      weekStartDate: monStr,
      weekEndDate: sunStr,
      thisWeek: {
        xp: thisWeekXp,
        workouts: thisWeekWorkouts,
        prs: thisWeekPrs,
        avgScore: avgThisWeekScore,
        noJunkDays,
      },
      prevWeek: {
        xp: prevWeekXp,
        workouts: prevWeekWorkouts,
      },
      comparison: {
        xpChangePct,
        workoutsDiff: thisWeekWorkouts - prevWeekWorkouts,
      },
      wins,
      improve,
      reflection,
      unit: profile?.unitPreference || "kg",
    });
  } catch (error) {
    console.error("GET weekly review error:", error);
    return NextResponse.json({ error: "Could not fetch weekly review." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { weekStartDate, wentWell, didntGoWell, nextWeekPlan, notes } = body;

    if (!weekStartDate) {
      return NextResponse.json({ error: "weekStartDate is required." }, { status: 400 });
    }

    const reflection = await prisma.weeklyReflection.upsert({
      where: {
        userId_weekStartDate: {
          userId: sessionUser.userId,
          weekStartDate,
        },
      },
      create: {
        userId: sessionUser.userId,
        weekStartDate,
        wentWell: wentWell || null,
        didntGoWell: didntGoWell || null,
        nextWeekPlan: nextWeekPlan || null,
        notes: notes || null,
      },
      update: {
        wentWell: wentWell || null,
        didntGoWell: didntGoWell || null,
        nextWeekPlan: nextWeekPlan || null,
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true, reflection });
  } catch (error) {
    console.error("POST weekly reflection error:", error);
    return NextResponse.json({ error: "Could not save weekly reflection." }, { status: 500 });
  }
}
