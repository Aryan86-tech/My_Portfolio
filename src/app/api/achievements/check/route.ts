import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkLevelUp } from "@/lib/services/rpgEngine";

export async function POST() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({ where: { userId: sessionUser.userId } });
    const workoutCount = await prisma.workoutSession.count({ where: { userId: sessionUser.userId, status: "COMPLETED" } });
    const prCount = await prisma.pRRecord.count({ where: { userId: sessionUser.userId } });
    const junkDaysCount = await prisma.nutritionLog.count({ where: { userId: sessionUser.userId, noJunkFood: true } });
    const sugarDaysCount = await prisma.nutritionLog.count({ where: { userId: sessionUser.userId, noAddedSugar: true } });
    const weightCount = await prisma.bodyMeasurement.count({ where: { userId: sessionUser.userId, weight: { not: null } } });

    const streak = profile?.currentStreak || 0;
    const totalXp = profile?.totalXp || 0;

    const unlockedNow: Array<{ code: string; name: string; xpReward: number }> = [];

    // Helper evaluation rule
    const checkAndUnlock = async (code: string, condition: boolean) => {
      if (!condition) return;

      const achievement = await prisma.achievement.findUnique({ where: { code } });
      if (!achievement) return;

      const existing = await prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId: sessionUser.userId,
            achievementId: achievement.id,
          },
        },
      });

      if (!existing) {
        await prisma.userAchievement.create({
          data: {
            userId: sessionUser.userId,
            achievementId: achievement.id,
          },
        });

        // Award XP once via XPTransaction with unique reference
        const achRef = `ACHIEVEMENT_${code}`;
        const existingTx = await prisma.xPTransaction.findFirst({
          where: { userId: sessionUser.userId, referenceId: achRef },
        });

        if (!existingTx) {
          await prisma.xPTransaction.create({
            data: {
              userId: sessionUser.userId,
              amount: achievement.xpReward,
              source: "TASK",
              description: `Achievement Unlocked: ${achievement.name}`,
              referenceId: achRef,
            },
          });

          await prisma.profile.update({
            where: { userId: sessionUser.userId },
            data: { totalXp: { increment: achievement.xpReward } },
          });

          unlockedNow.push({
            code: achievement.code,
            name: achievement.name,
            xpReward: achievement.xpReward,
          });
        }
      }
    };

    await checkAndUnlock("WINTER_START", true);
    await checkAndUnlock("STREAK_3", streak >= 3);
    await checkAndUnlock("STREAK_7", streak >= 7);
    await checkAndUnlock("STREAK_14", streak >= 14);
    await checkAndUnlock("STREAK_30", streak >= 30);
    await checkAndUnlock("WORKOUT_1", workoutCount >= 1);
    await checkAndUnlock("WORKOUT_10", workoutCount >= 10);
    await checkAndUnlock("WORKOUT_25", workoutCount >= 25);
    await checkAndUnlock("PR_1", prCount >= 1);
    await checkAndUnlock("PR_5", prCount >= 5);
    await checkAndUnlock("JUNK_7", junkDaysCount >= 7);
    await checkAndUnlock("SUGAR_7", sugarDaysCount >= 7);
    await checkAndUnlock("WEIGHT_1", weightCount >= 1);
    await checkAndUnlock("XP_1000", totalXp >= 1000);
    await checkAndUnlock("XP_5000", totalXp >= 5000);

    const newProfile = await prisma.profile.findUnique({ where: { userId: sessionUser.userId } });
    const levelUpData = checkLevelUp(totalXp, newProfile?.totalXp || totalXp);

    return NextResponse.json({
      success: true,
      unlockedNow,
      newTotalXp: newProfile?.totalXp || totalXp,
      levelUpData,
    });
  } catch (error) {
    console.error("POST check achievements error:", error);
    return NextResponse.json({ error: "Could not evaluate achievements." }, { status: 500 });
  }
}
