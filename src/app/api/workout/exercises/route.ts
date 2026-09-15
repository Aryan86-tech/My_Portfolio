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
    const search = searchParams.get("search") || "";
    const muscleGroup = searchParams.get("muscleGroup") || "";
    const equipment = searchParams.get("equipment") || "";

    const whereCondition: any = {
      OR: [
        { userId: null }, // System global starter library
        { userId: sessionUser.userId }, // User custom exercises
      ],
    };

    if (search.trim()) {
      whereCondition.name = {
        contains: search.trim(),
      };
    }

    if (muscleGroup && muscleGroup !== "ALL") {
      whereCondition.muscleGroup = muscleGroup;
    }

    if (equipment && equipment !== "ALL") {
      whereCondition.equipment = equipment;
    }

    const exercises = await prisma.exercise.findMany({
      where: whereCondition,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ exercises });
  } catch (error) {
    console.error("GET exercises error:", error);
    return NextResponse.json(
      { error: "Could not fetch exercises." },
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
    const { name, muscleGroup, equipment, instructions } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Exercise name is required." }, { status: 400 });
    }

    const exercise = await prisma.exercise.create({
      data: {
        userId: sessionUser.userId,
        name: name.trim(),
        muscleGroup: muscleGroup || "Chest",
        equipment: equipment || "Barbell",
        instructions: instructions ? instructions.trim() : null,
        isCustom: true,
      },
    });

    return NextResponse.json({ success: true, exercise }, { status: 201 });
  } catch (error) {
    console.error("POST exercise error:", error);
    return NextResponse.json(
      { error: "Could not create exercise." },
      { status: 500 }
    );
  }
}
