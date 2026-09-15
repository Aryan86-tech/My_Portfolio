import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkLevelUp } from "@/lib/services/rpgEngine";

export async function POST(
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
    const { durationSeconds, notes } = body;

    const session = await prisma.workoutSession.findFirst({
      where: { id, userId: sessionUser.userId },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    // Prevent double completion XP if already completed
    if (session.status === "COMPLETED") {
      return NextResponse.json({
        success: true,
        message: "Workout was already finished.",
        session,
      });
    }

    let totalVolume = 0;
    let totalSets = 0;
    let totalReps = 0;
    const newPrs: Array<{ exerciseName: string; metric: string; value: number }> = [];

    // Calculate volume & inspect PRs for each completed set
    for (const se of session.exercises) {
      const completedSets = se.sets.filter((s) => s.completed);
      totalSets += completedSets.length;

      if (completedSets.length === 0) continue;

      let exerciseMaxWeight = 0;
      let prSetItem: typeof completedSets[0] | null = null;

      for (const setItem of completedSets) {
        totalReps += setItem.reps;
        const setVolume = setItem.weight * setItem.reps;
        totalVolume += setVolume;

        if (setItem.weight > exerciseMaxWeight) {
          exerciseMaxWeight = setItem.weight;
          prSetItem = setItem;
        }
      }

      if (prSetItem && exerciseMaxWeight > 0) {
        const estimated1RM = Math.round(prSetItem.weight * (1 + prSetItem.reps / 30) * 10) / 10;

        // Check if max weight beats historical PR prior to this session
        const prevBestWeight = await prisma.pRRecord.findFirst({
          where: {
            userId: sessionUser.userId,
            exerciseId: se.exerciseId,
            metric: "MAX_WEIGHT",
            sessionId: { not: session.id },
          },
          orderBy: { value: "desc" },
        });

        if (!prevBestWeight || exerciseMaxWeight > prevBestWeight.value) {
          await prisma.pRRecord.create({
            data: {
              userId: sessionUser.userId,
              exerciseId: se.exerciseId,
              sessionId: session.id,
              metric: "MAX_WEIGHT",
              value: exerciseMaxWeight,
              setDetails: JSON.stringify({ weight: prSetItem.weight, reps: prSetItem.reps, estimated1RM }),
            },
          });

          // Mark set as PR
          await prisma.workoutSet.update({
            where: { id: prSetItem.id },
            data: { isPr: true },
          });

          newPrs.push({
            exerciseName: se.exerciseNameSnapshot || se.exercise.name,
            metric: "Max Weight",
            value: exerciseMaxWeight,
          });

          // Award +25 XP PR Bonus ONCE per exercise per session
          await prisma.xPTransaction.create({
            data: {
              userId: sessionUser.userId,
              amount: 25,
              source: "PR",
              description: `New PR (${se.exerciseNameSnapshot || se.exercise.name}): ${exerciseMaxWeight}kg`,
              referenceId: session.id,
            },
          });
        }
      }
    }

    // Base Workout XP Rewards
    let workoutXp = 100; // Base completion XP
    const prXp = newPrs.length * 25;
    const totalWorkoutXpEarned = workoutXp + prXp;

    // Log completion XP transaction
    await prisma.xPTransaction.create({
      data: {
        userId: sessionUser.userId,
        amount: workoutXp,
        source: "WORKOUT",
        description: `Completed Workout: ${session.name}`,
        referenceId: session.id,
      },
    });

    // Update WorkoutSession record to COMPLETED
    const completedSession = await prisma.workoutSession.update({
      where: { id: session.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        durationSeconds: durationSeconds ? parseInt(durationSeconds) : 3600,
        totalVolume,
        totalSets,
        totalReps,
        xpEarned: totalWorkoutXpEarned,
        notes: notes || null,
      },
    });

    // Get current profile before XP increment
    const profile = await prisma.profile.findUnique({
      where: { userId: sessionUser.userId },
    });

    const oldXp = profile?.totalXp || 0;
    const newXp = oldXp + totalWorkoutXpEarned;

    // Update Profile total XP & workout streak
    await prisma.profile.update({
      where: { userId: sessionUser.userId },
      data: {
        totalXp: newXp,
        currentStreak: { increment: 1 },
      },
    });

    // Update today's DailyScore (Fitness component)
    const todayStr = new Date().toISOString().split("T")[0];
    await prisma.dailyScore.upsert({
      where: {
        userId_date: {
          userId: sessionUser.userId,
          date: todayStr,
        },
      },
      create: {
        userId: sessionUser.userId,
        date: todayStr,
        score: 85,
        fitnessScore: 100,
        nutritionScore: 80,
        disciplineScore: 80,
        recoveryScore: 80,
      },
      update: {
        fitnessScore: 100,
      },
    });

    const levelUpData = checkLevelUp(oldXp, newXp);

    return NextResponse.json({
      success: true,
      summary: {
        durationSeconds: completedSession.durationSeconds,
        totalExercises: session.exercises.length,
        totalSets,
        totalReps,
        totalVolume,
        xpEarned: totalWorkoutXpEarned,
        prs: newPrs,
      },
      levelUpData,
    });
  } catch (error) {
    console.error("POST finish workout session error:", error);
    return NextResponse.json(
      { error: "Could not finish workout session." },
      { status: 500 }
    );
  }
}
