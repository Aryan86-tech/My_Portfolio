import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkLevelUp } from "@/lib/services/rpgEngine";

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const todayStr = dateParam || new Date().toISOString().split("T")[0];

    const profile = await prisma.profile.findUnique({
      where: { userId: sessionUser.userId },
    });

    let nutritionLog = await prisma.nutritionLog.findUnique({
      where: {
        userId_date: {
          userId: sessionUser.userId,
          date: todayStr,
        },
      },
    });

    if (!nutritionLog) {
      nutritionLog = await prisma.nutritionLog.create({
        data: {
          userId: sessionUser.userId,
          date: todayStr,
          noAddedSugar: true,
          noJunkFood: true,
          processedFoodStatus: "ON_TRACK",
          nutritionScore: 100,
        },
      });
    }

    let waterLog = await prisma.waterLog.findUnique({
      where: {
        userId_date: {
          userId: sessionUser.userId,
          date: todayStr,
        },
      },
    });

    if (!waterLog) {
      waterLog = await prisma.waterLog.create({
        data: {
          userId: sessionUser.userId,
          date: todayStr,
          amountMl: 0,
        },
      });
    }

    const foodLogs = await prisma.foodLog.findMany({
      where: { userId: sessionUser.userId, date: todayStr },
      orderBy: { createdAt: "asc" },
    });

    const currentProtein = nutritionLog.protein || foodLogs.reduce((acc, item) => acc + (item.protein || 0), 0);
    const currentCalories = nutritionLog.calories || foodLogs.reduce((acc, item) => acc + (item.calories || 0), 0);

    return NextResponse.json({
      date: todayStr,
      noAddedSugar: nutritionLog.noAddedSugar,
      noJunkFood: nutritionLog.noJunkFood,
      processedFoodStatus: nutritionLog.processedFoodStatus,
      nutritionScore: nutritionLog.nutritionScore,
      checkInStatus: nutritionLog.checkInStatus,
      waterMl: waterLog.amountMl,
      waterGoalMl: profile?.waterGoalMl || 3000,
      proteinGrams: currentProtein,
      proteinGoalGrams: profile?.proteinGoalGrams || 150,
      caloriesKcal: currentCalories,
      calorieGoalKcal: profile?.calorieGoalKcal || null,
      foodLogs,
      goalsEnabled: {
        sugar: profile?.sugarGoalEnabled ?? true,
        junk: profile?.junkFoodGoalEnabled ?? true,
        processed: profile?.processedFoodGoalEnabled ?? true,
      },
    });
  } catch (error) {
    console.error("GET nutrition today error:", error);
    return NextResponse.json({ error: "Could not fetch nutrition data." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { date, noAddedSugar, noJunkFood, processedFoodStatus, checkInStatus, calories, carbs, fat, notes } = body;

    const todayStr = date || new Date().toISOString().split("T")[0];

    const profile = await prisma.profile.findUnique({
      where: { userId: sessionUser.userId },
    });

    const oldXp = profile?.totalXp || 0;

    // Get current water log
    const waterLog = await prisma.waterLog.findUnique({
      where: { userId_date: { userId: sessionUser.userId, date: todayStr } },
    });
    const waterMl = waterLog?.amountMl || 0;
    const waterGoalMl = profile?.waterGoalMl || 3000;

    // Upsert nutrition log
    const existingLog = await prisma.nutritionLog.findUnique({
      where: { userId_date: { userId: sessionUser.userId, date: todayStr } },
    });

    const isSugarClean = noAddedSugar !== undefined ? Boolean(noAddedSugar) : (existingLog?.noAddedSugar ?? true);
    const isJunkClean = noJunkFood !== undefined ? Boolean(noJunkFood) : (existingLog?.noJunkFood ?? true);
    const procStatus = processedFoodStatus || existingLog?.processedFoodStatus || "ON_TRACK";
    const checkIn = checkInStatus !== undefined ? checkInStatus : existingLog?.checkInStatus;

    // Calculate score components
    const sugarPart = isSugarClean ? 25 : 0;
    const junkPart = isJunkClean ? 25 : 0;
    const procPart = procStatus === "ON_TRACK" ? 20 : 0;

    const currentProtein = existingLog?.protein || 0;
    const proteinGoal = profile?.proteinGoalGrams || 150;
    const proteinPart = Math.min(15, Math.round((currentProtein / Math.max(1, proteinGoal)) * 15));

    const waterPart = Math.min(15, Math.round((waterMl / Math.max(1, waterGoalMl)) * 15));

    const nutritionScore = sugarPart + junkPart + procPart + proteinPart + waterPart;

    const nutritionLog = await prisma.nutritionLog.upsert({
      where: {
        userId_date: {
          userId: sessionUser.userId,
          date: todayStr,
        },
      },
      create: {
        userId: sessionUser.userId,
        date: todayStr,
        noAddedSugar: isSugarClean,
        noJunkFood: isJunkClean,
        processedFoodStatus: procStatus,
        checkInStatus: checkIn || null,
        nutritionScore,
        calories: calories ? Number(calories) : null,
        carbs: carbs ? Number(carbs) : null,
        fat: fat ? Number(fat) : null,
        notes: notes || null,
      },
      update: {
        noAddedSugar: isSugarClean,
        noJunkFood: isJunkClean,
        processedFoodStatus: procStatus,
        ...(checkIn !== undefined && { checkInStatus: checkIn }),
        nutritionScore,
        ...(calories !== undefined && { calories: Number(calories) }),
        ...(carbs !== undefined && { carbs: Number(carbs) }),
        ...(fat !== undefined && { fat: Number(fat) }),
        ...(notes !== undefined && { notes }),
      },
    });

    let totalXpEarned = 0;

    // Award +50 XP for No Junk Food clean (once per day)
    if (isJunkClean) {
      const junkRef = `NUTRITION_JUNK_${todayStr}`;
      const existingJunkTx = await prisma.xPTransaction.findFirst({
        where: { userId: sessionUser.userId, referenceId: junkRef },
      });
      if (!existingJunkTx) {
        await prisma.xPTransaction.create({
          data: {
            userId: sessionUser.userId,
            amount: 50,
            source: "TASK",
            description: "No Junk Food Clean",
            referenceId: junkRef,
          },
        });
        totalXpEarned += 50;
      }
    }

    // Award +50 XP for No Added Sugar clean (once per day)
    if (isSugarClean) {
      const sugarRef = `NUTRITION_SUGAR_${todayStr}`;
      const existingSugarTx = await prisma.xPTransaction.findFirst({
        where: { userId: sessionUser.userId, referenceId: sugarRef },
      });
      if (!existingSugarTx) {
        await prisma.xPTransaction.create({
          data: {
            userId: sessionUser.userId,
            amount: 50,
            source: "TASK",
            description: "No Added Sugar Clean",
            referenceId: sugarRef,
          },
        });
        totalXpEarned += 50;
      }
    }

    const newXp = oldXp + totalXpEarned;

    if (totalXpEarned > 0) {
      await prisma.profile.update({
        where: { userId: sessionUser.userId },
        data: { totalXp: newXp },
      });
    }

    // Update DailyScore table (Nutrition 25% weight)
    const existingDaily = await prisma.dailyScore.findUnique({
      where: { userId_date: { userId: sessionUser.userId, date: todayStr } },
    });

    const fitScore = existingDaily?.fitnessScore ?? 80;
    const discScore = existingDaily?.disciplineScore ?? 80;
    const recScore = existingDaily?.recoveryScore ?? 80;
    const overallScore = Math.round(fitScore * 0.3 + nutritionScore * 0.25 + discScore * 0.25 + recScore * 0.2);

    await prisma.dailyScore.upsert({
      where: { userId_date: { userId: sessionUser.userId, date: todayStr } },
      create: {
        userId: sessionUser.userId,
        date: todayStr,
        score: overallScore,
        fitnessScore: fitScore,
        nutritionScore,
        disciplineScore: discScore,
        recoveryScore: recScore,
      },
      update: {
        nutritionScore,
        score: overallScore,
      },
    });

    const levelUpData = checkLevelUp(oldXp, newXp);

    return NextResponse.json({
      success: true,
      nutritionLog,
      nutritionScore,
      xpEarned: totalXpEarned,
      newXp,
      levelUpData,
    });
  } catch (error) {
    console.error("POST nutrition today error:", error);
    return NextResponse.json({ error: "Could not update nutrition status." }, { status: 500 });
  }
}
