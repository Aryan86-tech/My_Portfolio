import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const { action, sessionExerciseId, setId, weight, reps, completed, exerciseId } = body;

    // Verify session belongs to user
    const session = await prisma.workoutSession.findFirst({
      where: { id, userId: sessionUser.userId },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    // Action 1: Add new exercise to active session
    if (action === "ADD_EXERCISE" && exerciseId) {
      const exercise = await prisma.exercise.findUnique({
        where: { id: exerciseId },
      });

      if (!exercise) {
        return NextResponse.json({ error: "Exercise not found." }, { status: 404 });
      }

      const count = await prisma.workoutSessionExercise.count({
        where: { sessionId: id },
      });

      const se = await prisma.workoutSessionExercise.create({
        data: {
          sessionId: id,
          exerciseId,
          exerciseNameSnapshot: exercise.name,
          orderIndex: count,
        },
      });

      // Add 3 default sets
      for (let s = 1; s <= 3; s++) {
        await prisma.workoutSet.create({
          data: {
            sessionExerciseId: se.id,
            setNumber: s,
            weight: 60,
            reps: 10,
            completed: false,
          },
        });
      }

      return NextResponse.json({ success: true, sessionExercise: se });
    }

    // Action 2: Add set to an exercise in active session
    if (action === "ADD_SET" && sessionExerciseId) {
      const setRecords = await prisma.workoutSet.findMany({
        where: { sessionExerciseId },
        orderBy: { setNumber: "asc" },
      });

      const lastSet = setRecords[setRecords.length - 1];
      const nextSetNumber = setRecords.length + 1;

      const newSet = await prisma.workoutSet.create({
        data: {
          sessionExerciseId,
          setNumber: nextSetNumber,
          weight: lastSet ? lastSet.weight : 60,
          reps: lastSet ? lastSet.reps : 10,
          completed: false,
        },
      });

      return NextResponse.json({ success: true, set: newSet });
    }

    // Action 3: Update set (weight, reps, completed toggle)
    if (action === "UPDATE_SET" && setId) {
      const updatedSet = await prisma.workoutSet.update({
        where: { id: setId },
        data: {
          weight: weight !== undefined ? Math.max(0, parseFloat(weight)) : undefined,
          reps: reps !== undefined ? Math.max(0, parseInt(reps)) : undefined,
          completed: completed !== undefined ? Boolean(completed) : undefined,
        },
      });

      return NextResponse.json({ success: true, set: updatedSet });
    }

    // Action 4: Delete set
    if (action === "DELETE_SET" && setId) {
      await prisma.workoutSet.delete({
        where: { id: setId },
      });

      return NextResponse.json({ success: true, message: "Set deleted." });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("POST session set error:", error);
    return NextResponse.json(
      { error: "Could not update set." },
      { status: 500 }
    );
  }
}
