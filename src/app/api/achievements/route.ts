import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Standard Default System Achievements
    const defaultAchievements = [
      { code: "STREAK_3", name: "3 Day Streak", description: "Maintain a 3-day active streak.", category: "Consistency", xpReward: 50, icon: "flame" },
      { code: "STREAK_7", name: "7 Day Streak", description: "Maintain a 7-day active streak.", category: "Consistency", xpReward: 100, icon: "flame" },
      { code: "STREAK_14", name: "14 Day Streak", description: "Maintain a 14-day active streak.", category: "Consistency", xpReward: 200, icon: "flame" },
      { code: "STREAK_30", name: "30 Day Streak", description: "Maintain a 30-day active streak.", category: "Consistency", xpReward: 500, icon: "flame" },
      { code: "WORKOUT_1", name: "First Workout", description: "Complete your first workout session.", category: "Fitness", xpReward: 50, icon: "dumbbell" },
      { code: "WORKOUT_10", name: "10 Workouts", description: "Complete 10 workout sessions.", category: "Fitness", xpReward: 150, icon: "dumbbell" },
      { code: "WORKOUT_25", name: "25 Workouts", description: "Complete 25 workout sessions.", category: "Fitness", xpReward: 300, icon: "dumbbell" },
      { code: "PR_1", name: "First Personal Record", description: "Achieve your first PR in any exercise.", category: "Fitness", xpReward: 50, icon: "trophy" },
      { code: "PR_5", name: "5 Personal Records", description: "Set 5 Personal Records.", category: "Fitness", xpReward: 150, icon: "trophy" },
      { code: "JUNK_7", name: "7 Days Clean Nutrition", description: "Maintain 7 days of No Junk Food.", category: "Nutrition", xpReward: 100, icon: "apple" },
      { code: "SUGAR_7", name: "7 Days No Added Sugar", description: "Maintain 7 days of No Added Sugar.", category: "Nutrition", xpReward: 100, icon: "apple" },
      { code: "WEIGHT_1", name: "First Weigh-In", description: "Log your first weight entry.", category: "Body", xpReward: 50, icon: "scale" },
      { code: "XP_1000", name: "1,000 XP Milestone", description: "Earn 1,000 Total XP.", category: "XP", xpReward: 100, icon: "zap" },
      { code: "XP_5000", name: "5,000 XP Milestone", description: "Earn 5,000 Total XP.", category: "XP", xpReward: 250, icon: "zap" },
      { code: "WINTER_START", name: "Winter Arc Initiated", description: "Begin your Winter Arc discipline transformation.", category: "Winter Arc", xpReward: 100, icon: "snowflake" },
    ];

    // Upsert default definitions into DB if missing
    for (const ach of defaultAchievements) {
      await prisma.achievement.upsert({
        where: { code: ach.code },
        create: {
          code: ach.code,
          name: ach.name,
          description: ach.description,
          category: ach.category,
          xpReward: ach.xpReward,
          icon: ach.icon,
          criteria: JSON.stringify({ code: ach.code }),
        },
        update: {},
      });
    }

    const allDbAchievements = await prisma.achievement.findMany();
    const userUnlocked = await prisma.userAchievement.findMany({
      where: { userId: sessionUser.userId },
      include: { achievement: true },
    });

    const unlockedCodes = new Set(userUnlocked.map((u) => u.achievement.code));

    const profile = await prisma.profile.findUnique({ where: { userId: sessionUser.userId } });
    const workoutCount = await prisma.workoutSession.count({ where: { userId: sessionUser.userId, status: "COMPLETED" } });
    const prCount = await prisma.pRRecord.count({ where: { userId: sessionUser.userId } });
    const junkDaysCount = await prisma.nutritionLog.count({ where: { userId: sessionUser.userId, noJunkFood: true } });
    const sugarDaysCount = await prisma.nutritionLog.count({ where: { userId: sessionUser.userId, noAddedSugar: true } });

    const resultAchievements = allDbAchievements.map((ach) => {
      const isUnlocked = unlockedCodes.has(ach.code);
      let currentVal = 0;
      let targetVal = 1;

      if (ach.code === "STREAK_3") { currentVal = profile?.currentStreak || 0; targetVal = 3; }
      else if (ach.code === "STREAK_7") { currentVal = profile?.currentStreak || 0; targetVal = 7; }
      else if (ach.code === "STREAK_14") { currentVal = profile?.currentStreak || 0; targetVal = 14; }
      else if (ach.code === "STREAK_30") { currentVal = profile?.currentStreak || 0; targetVal = 30; }
      else if (ach.code === "WORKOUT_1") { currentVal = workoutCount; targetVal = 1; }
      else if (ach.code === "WORKOUT_10") { currentVal = workoutCount; targetVal = 10; }
      else if (ach.code === "WORKOUT_25") { currentVal = workoutCount; targetVal = 25; }
      else if (ach.code === "PR_1") { currentVal = prCount; targetVal = 1; }
      else if (ach.code === "PR_5") { currentVal = prCount; targetVal = 5; }
      else if (ach.code === "JUNK_7") { currentVal = junkDaysCount; targetVal = 7; }
      else if (ach.code === "SUGAR_7") { currentVal = sugarDaysCount; targetVal = 7; }
      else if (ach.code === "XP_1000") { currentVal = profile?.totalXp || 0; targetVal = 1000; }
      else if (ach.code === "XP_5000") { currentVal = profile?.totalXp || 0; targetVal = 5000; }
      else if (ach.code === "WINTER_START") { currentVal = 1; targetVal = 1; }

      const progressPct = Math.min(100, Math.round((currentVal / Math.max(1, targetVal)) * 100));

      return {
        id: ach.id,
        code: ach.code,
        name: ach.name,
        description: ach.description,
        category: ach.category,
        xpReward: ach.xpReward,
        icon: ach.icon,
        isUnlocked,
        currentVal,
        targetVal,
        progressPct,
      };
    });

    return NextResponse.json({ achievements: resultAchievements });
  } catch (error) {
    console.error("GET achievements error:", error);
    return NextResponse.json({ error: "Could not fetch achievements." }, { status: 500 });
  }
}
