import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      username,
      mainGoals,
      currentWeight,
      targetWeight,
      unitPreference,
      winterArcDuration,
      startDate,
      customHabits,
      waterGoalMl,
    } = body;

    const start = startDate ? new Date(startDate) : new Date();
    const durationDays = Number(winterArcDuration) || 90;
    const end = new Date(start);
    end.setDate(end.getDate() + durationDays);

    // 1. Update user username if changed and not conflicting
    if (username && username.trim() && username.trim() !== sessionUser.username) {
      const trimmedName = username.trim();
      const existingUser = await prisma.user.findUnique({
        where: { username: trimmedName },
      });

      if (existingUser && existingUser.id !== sessionUser.userId) {
        return NextResponse.json(
          { error: `Username "${trimmedName}" is already taken. Please choose another call sign.` },
          { status: 400 }
        );
      }

      await prisma.user.update({
        where: { id: sessionUser.userId },
        data: { username: trimmedName },
      });
    }

    // 2. Create or update User Profile
    const profile = await prisma.profile.upsert({
      where: { userId: sessionUser.userId },
      create: {
        userId: sessionUser.userId,
        mainGoals: JSON.stringify(mainGoals || []),
        currentWeight: currentWeight ? parseFloat(currentWeight) : null,
        targetWeight: targetWeight ? parseFloat(targetWeight) : null,
        unitPreference: unitPreference || "kg",
        waterGoalMl: waterGoalMl ? parseInt(waterGoalMl) : 3000,
        totalXp: 0,
        level: 1,
        rank: "RECRUIT",
      },
      update: {
        mainGoals: JSON.stringify(mainGoals || []),
        currentWeight: currentWeight ? parseFloat(currentWeight) : null,
        targetWeight: targetWeight ? parseFloat(targetWeight) : null,
        unitPreference: unitPreference || "kg",
        waterGoalMl: waterGoalMl ? parseInt(waterGoalMl) : 3000,
      },
    });

    // 3. Create Winter Arc Challenge
    const winterArc = await prisma.winterArc.create({
      data: {
        userId: sessionUser.userId,
        startDate: start,
        endDate: end,
        totalDays: durationDays,
        status: "ACTIVE",
        milestones: JSON.stringify([7, 14, 30, 60, 90]),
      },
    });

    // 4. Create default Starter Quests
    const starterQuests = [
      { name: "Daily Workout Session", category: "Fitness", difficulty: "HARD", xpReward: 100, scheduleType: "DAILY" },
      { name: "Drink 3L Water", category: "Nutrition", difficulty: "EASY", xpReward: 30, scheduleType: "DAILY" },
      { name: "No Junk Food", category: "Nutrition", difficulty: "HARD", xpReward: 50, scheduleType: "DAILY" },
      { name: "No Added Sugar", category: "Nutrition", difficulty: "HARD", xpReward: 50, scheduleType: "DAILY" },
      { name: "Focus / Deep Work 2 Hours", category: "Discipline", difficulty: "HARD", xpReward: 50, scheduleType: "DAILY" },
      { name: "Read 15 Minutes", category: "Personal", difficulty: "MEDIUM", xpReward: 25, scheduleType: "DAILY" },
    ];

    for (const q of starterQuests) {
      await prisma.task.create({
        data: {
          userId: sessionUser.userId,
          name: q.name,
          category: q.category,
          difficulty: q.difficulty,
          xpReward: q.xpReward,
          scheduleType: q.scheduleType,
        },
      });
    }

    // 5. Create default Habits
    const habitsToCreate = (customHabits && customHabits.length > 0)
      ? customHabits
      : ["Workout", "Walking 10k Steps", "Meditation", "Read 15 Pages", "No Sugar", "No Junk Food"];

    for (const habitName of habitsToCreate) {
      await prisma.habit.create({
        data: {
          userId: sessionUser.userId,
          name: habitName,
          frequency: "DAILY",
          xpReward: 25,
        },
      });
    }

    // 6. Seed Default Exercises for User
    const defaultExercises = [
      { name: "Bench Press", muscleGroup: "Chest", equipment: "Barbell" },
      { name: "Incline Dumbbell Press", muscleGroup: "Chest", equipment: "Dumbbell" },
      { name: "Cable Fly", muscleGroup: "Chest", equipment: "Cable" },
      { name: "Shoulder Press", muscleGroup: "Shoulders", equipment: "Dumbbell" },
      { name: "Lateral Raise", muscleGroup: "Shoulders", equipment: "Dumbbell" },
      { name: "Tricep Pushdown", muscleGroup: "Arms", equipment: "Cable" },
      { name: "Barbell Squat", muscleGroup: "Legs", equipment: "Barbell" },
      { name: "Deadlift", muscleGroup: "Back", equipment: "Barbell" },
      { name: "Lat Pulldown", muscleGroup: "Back", equipment: "Cable" },
      { name: "Barbell Row", muscleGroup: "Back", equipment: "Barbell" },
      { name: "Dumbbell Bicep Curl", muscleGroup: "Arms", equipment: "Dumbbell" },
    ];

    for (const ex of defaultExercises) {
      await prisma.exercise.create({
        data: {
          userId: sessionUser.userId,
          name: ex.name,
          muscleGroup: ex.muscleGroup,
          equipment: ex.equipment,
          isCustom: false,
        },
      });
    }

    // 7. Record initial weight if provided
    if (currentWeight) {
      const todayStr = new Date().toISOString().split("T")[0];
      await prisma.bodyMeasurement.create({
        data: {
          userId: sessionUser.userId,
          date: todayStr,
          weight: parseFloat(currentWeight),
          notes: "Initial weight during Winter Arc setup",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "YOUR WINTER ARC BEGINS NOW.",
      profile,
      winterArc,
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Could not complete onboarding. Please try again." },
      { status: 500 }
    );
  }
}
