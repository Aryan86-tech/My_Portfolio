import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
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
    const { name, description, exerciseIds } = body;

    const existing = await prisma.workoutTemplate.findFirst({
      where: { id, userId: sessionUser.userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Template not found." }, { status: 404 });
    }

    await prisma.workoutTemplate.update({
      where: { id },
      data: {
        name: name ? name.trim() : existing.name,
        description: description !== undefined ? description : existing.description,
      },
    });

    if (exerciseIds && Array.isArray(exerciseIds)) {
      // Re-create template exercises order
      await prisma.workoutTemplateExercise.deleteMany({
        where: { templateId: id },
      });

      for (let index = 0; index < exerciseIds.length; index++) {
        const exId = exerciseIds[index];
        await prisma.workoutTemplateExercise.create({
          data: {
            templateId: id,
            exerciseId: exId,
            orderIndex: index,
            targetSets: 3,
            targetReps: 10,
          },
        });
      }
    }

    const updated = await prisma.workoutTemplate.findUnique({
      where: { id },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    return NextResponse.json({ success: true, template: updated });
  } catch (error) {
    console.error("PUT template error:", error);
    return NextResponse.json(
      { error: "Could not update template." },
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

    const existing = await prisma.workoutTemplate.findFirst({
      where: { id, userId: sessionUser.userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Template not found." }, { status: 404 });
    }

    // Delete template exercises & template (historical workout sessions are preserved)
    await prisma.workoutTemplateExercise.deleteMany({
      where: { templateId: id },
    });

    await prisma.workoutTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Template deleted." });
  } catch (error) {
    console.error("DELETE template error:", error);
    return NextResponse.json(
      { error: "Could not delete template." },
      { status: 500 }
    );
  }
}

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

    const original = await prisma.workoutTemplate.findFirst({
      where: { id, userId: sessionUser.userId },
      include: { exercises: true },
    });

    if (!original) {
      return NextResponse.json({ error: "Template not found." }, { status: 404 });
    }

    const duplicated = await prisma.workoutTemplate.create({
      data: {
        userId: sessionUser.userId,
        name: `${original.name} (Copy)`,
        description: original.description,
      },
    });

    for (const ex of original.exercises) {
      await prisma.workoutTemplateExercise.create({
        data: {
          templateId: duplicated.id,
          exerciseId: ex.exerciseId,
          orderIndex: ex.orderIndex,
          targetSets: ex.targetSets,
          targetReps: ex.targetReps,
        },
      });
    }

    const fullDuplicated = await prisma.workoutTemplate.findUnique({
      where: { id: duplicated.id },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    return NextResponse.json({ success: true, template: fullDuplicated }, { status: 201 });
  } catch (error) {
    console.error("Duplicate template error:", error);
    return NextResponse.json(
      { error: "Could not duplicate template." },
      { status: 500 }
    );
  }
}
