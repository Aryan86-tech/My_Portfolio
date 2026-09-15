import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const session = await prisma.workoutSession.findFirst({
      where: { id, userId: sessionUser.userId },
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

    if (!session) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    // Pre-fetch previous performance history for each exercise in this session
    const previousPerformanceMap: Record<string, Array<{ weight: number; reps: number }>> = {};

    for (const se of session.exercises) {
      const lastCompleted = await prisma.workoutSessionExercise.findFirst({
        where: {
          exerciseId: se.exerciseId,
          session: {
            userId: sessionUser.userId,
            status: "COMPLETED",
            id: { not: session.id },
          },
        },
        include: {
          sets: {
            where: { completed: true },
            orderBy: { setNumber: "asc" },
          },
        },
        orderBy: { session: { completedAt: "desc" } },
      });

      if (lastCompleted && lastCompleted.sets.length > 0) {
        previousPerformanceMap[se.exerciseId] = lastCompleted.sets.map((s) => ({
          weight: s.weight,
          reps: s.reps,
        }));
      }
    }

    return NextResponse.json({ session, previousPerformanceMap });
  } catch (error) {
    console.error("GET session details error:", error);
    return NextResponse.json(
      { error: "Could not fetch session details." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.workoutSession.findFirst({
      where: { id, userId: sessionUser.userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    // Delete session and child sets
    await prisma.workoutSession.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Session discarded." });
  } catch (error) {
    console.error("DELETE session error:", error);
    return NextResponse.json(
      { error: "Could not discard session." },
      { status: 500 }
    );
  }
}
