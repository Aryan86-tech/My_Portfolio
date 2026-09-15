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
    const exerciseId = searchParams.get("exerciseId");

    if (!exerciseId) {
      // Return list of exercises the user has performed for selection
      const performedExercises = await prisma.workoutSessionExercise.findMany({
        where: {
          session: {
            userId: sessionUser.userId,
            status: "COMPLETED",
          },
        },
        select: {
          exerciseId: true,
          exerciseNameSnapshot: true,
          exercise: { select: { id: true, name: true, muscleGroup: true } },
        },
        distinct: ["exerciseId"],
      });

      return NextResponse.json({ performedExercises });
    }

    // Fetch PR history records for this exercise
    const prs = await prisma.pRRecord.findMany({
      where: {
        userId: sessionUser.userId,
        exerciseId,
      },
      orderBy: { achievedAt: "desc" },
    });

    // Fetch session exercise history for progress charts
    const sessionExercises = await prisma.workoutSessionExercise.findMany({
      where: {
        exerciseId,
        session: {
          userId: sessionUser.userId,
          status: "COMPLETED",
        },
      },
      include: {
        session: { select: { completedAt: true } },
        sets: { where: { completed: true }, orderBy: { setNumber: "asc" } },
      },
      orderBy: { session: { completedAt: "asc" } },
    });

    const progressData = sessionExercises.map((se) => {
      let maxWeight = 0;
      let maxReps = 0;
      let totalVolume = 0;
      let maxEstimated1RM = 0;

      for (const setItem of se.sets) {
        if (setItem.weight > maxWeight) maxWeight = setItem.weight;
        if (setItem.reps > maxReps) maxReps = setItem.reps;
        totalVolume += setItem.weight * setItem.reps;

        // Epley 1RM formula: 1RM = weight * (1 + reps/30)
        const e1rm = setItem.weight * (1 + setItem.reps / 30);
        if (e1rm > maxEstimated1RM) maxEstimated1RM = e1rm;
      }

      return {
        date: se.session.completedAt ? se.session.completedAt.toISOString().split("T")[0] : "",
        maxWeight,
        maxReps,
        totalVolume,
        estimated1RM: Math.round(maxEstimated1RM * 10) / 10,
      };
    });

    return NextResponse.json({ progressData, prs });
  } catch (error) {
    console.error("GET progress error:", error);
    return NextResponse.json(
      { error: "Could not fetch workout progress." },
      { status: 500 }
    );
  }
}
