import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const schedules = await prisma.weeklyWorkoutSchedule.findMany({
      where: { userId: sessionUser.userId },
      include: {
        template: {
          include: {
            exercises: {
              include: { exercise: true },
              orderBy: { orderIndex: "asc" },
            },
          },
        },
      },
      orderBy: { dayOfWeek: "asc" },
    });

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error("GET schedule error:", error);
    return NextResponse.json(
      { error: "Could not fetch weekly schedule." },
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

    const { dayOfWeek, templateId, isRestDay } = await request.json();

    if (dayOfWeek === undefined || dayOfWeek === null) {
      return NextResponse.json({ error: "dayOfWeek is required." }, { status: 400 });
    }

    const dayNum = Number(dayOfWeek);

    const schedule = await prisma.weeklyWorkoutSchedule.upsert({
      where: {
        userId_dayOfWeek: {
          userId: sessionUser.userId,
          dayOfWeek: dayNum,
        },
      },
      create: {
        userId: sessionUser.userId,
        dayOfWeek: dayNum,
        templateId: isRestDay ? null : templateId || null,
        isRestDay: Boolean(isRestDay),
      },
      update: {
        templateId: isRestDay ? null : templateId || null,
        isRestDay: Boolean(isRestDay),
      },
      include: { template: true },
    });

    return NextResponse.json({ success: true, schedule });
  } catch (error) {
    console.error("POST schedule error:", error);
    return NextResponse.json(
      { error: "Could not update weekly schedule." },
      { status: 500 }
    );
  }
}
