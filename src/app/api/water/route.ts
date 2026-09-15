import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amountMl } = await request.json();
    const todayStr = new Date().toISOString().split("T")[0];

    const waterLog = await prisma.waterLog.upsert({
      where: {
        userId_date: {
          userId: sessionUser.userId,
          date: todayStr,
        },
      },
      create: {
        userId: sessionUser.userId,
        date: todayStr,
        amountMl: Number(amountMl) || 0,
      },
      update: {
        amountMl: Number(amountMl) || 0,
      },
    });

    return NextResponse.json({ success: true, waterLog });
  } catch (error) {
    console.error("Water update error:", error);
    return NextResponse.json(
      { error: "Could not log water." },
      { status: 500 }
    );
  }
}
