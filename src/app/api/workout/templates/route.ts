import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const templates = await prisma.workoutTemplate.findMany({
      where: { userId: sessionUser.userId },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { orderIndex: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("GET templates error:", error);
    return NextResponse.json(
      { error: "Could not fetch workout templates." },
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

    const body = await request.json();
    const { name, description, exerciseIds } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Template name is required." }, { status: 400 });
    }

    const template = await prisma.workoutTemplate.create({
      data: {
        userId: sessionUser.userId,
        name: name.trim(),
        description: description ? description.trim() : null,
      },
    });

    if (exerciseIds && Array.isArray(exerciseIds) && exerciseIds.length > 0) {
      for (let index = 0; index < exerciseIds.length; index++) {
        const exId = exerciseIds[index];
        await prisma.workoutTemplateExercise.create({
          data: {
            templateId: template.id,
            exerciseId: exId,
            orderIndex: index,
            targetSets: 3,
            targetReps: 10,
          },
        });
      }
    }

    const fullTemplate = await prisma.workoutTemplate.findUnique({
      where: { id: template.id },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    return NextResponse.json({ success: true, template: fullTemplate }, { status: 201 });
  } catch (error) {
    console.error("POST template error:", error);
    return NextResponse.json(
      { error: "Could not create workout template." },
      { status: 500 }
    );
  }
}
