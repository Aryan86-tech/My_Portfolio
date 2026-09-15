import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check for any currently active IN_PROGRESS session
    const activeSession = await prisma.workoutSession.findFirst({
      where: {
        userId: sessionUser.userId,
        status: "IN_PROGRESS",
      },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: { orderBy: { setNumber: "asc" } },
          },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    return NextResponse.json({ activeSession });
  } catch (error) {
    console.error("GET active session error:", error);
    return NextResponse.json(
      { error: "Could not fetch active session." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { templateId, name } = await request.json();

    // If an active session already exists, return it to prevent duplicate active sessions
    const existingActive = await prisma.workoutSession.findFirst({
      where: {
        userId: sessionUser.userId,
        status: "IN_PROGRESS",
      },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: { orderBy: { setNumber: "asc" } },
          },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (existingActive) {
      return NextResponse.json({ success: true, session: existingActive });
    }

    let sessionName = name || "Quick Workout";
    let templateExercises: any[] = [];

    if (templateId) {
      const template = await prisma.workoutTemplate.findFirst({
        where: { id: templateId, userId: sessionUser.userId },
        include: {
          exercises: {
            include: { exercise: true },
            orderBy: { orderIndex: "asc" },
          },
        },
      });

      if (template) {
        sessionName = template.name;
        templateExercises = template.exercises;
      }
    }

    // Create new WorkoutSession record
    const session = await prisma.workoutSession.create({
      data: {
        userId: sessionUser.userId,
        templateId: templateId || null,
        name: sessionName,
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
    });

    // Populate session exercises & initial sets with snapshot
    for (let i = 0; i < templateExercises.length; i++) {
      const te = templateExercises[i];
      const sessionExercise = await prisma.workoutSessionExercise.create({
        data: {
          sessionId: session.id,
          exerciseId: te.exerciseId,
          exerciseNameSnapshot: te.exercise.name,
          orderIndex: i,
        },
      });

      // Fetch last completed set values for baseline default if available
      const lastSessionExercise = await prisma.workoutSessionExercise.findFirst({
        where: {
          exerciseId: te.exerciseId,
          session: {
            userId: sessionUser.userId,
            status: "COMPLETED",
          },
        },
        include: {
          sets: { orderBy: { setNumber: "asc" } },
        },
        orderBy: { session: { completedAt: "desc" } },
      });

      const targetSetCount = te.targetSets || 3;
      for (let s = 1; s <= targetSetCount; s++) {
        const prevSet = lastSessionExercise?.sets[s - 1];
        await prisma.workoutSet.create({
          data: {
            sessionExerciseId: sessionExercise.id,
            setNumber: s,
            weight: prevSet?.weight || 60,
            reps: prevSet?.reps || 10,
            completed: false,
          },
        });
      }
    }

    const fullSession = await prisma.workoutSession.findUnique({
      where: { id: session.id },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: { orderBy: { setNumber: "asc" } },
          },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    return NextResponse.json({ success: true, session: fullSession }, { status: 201 });
  } catch (error) {
    console.error("POST session error:", error);
    return NextResponse.json(
      { error: "Could not start workout session." },
      { status: 500 }
    );
  }
}
