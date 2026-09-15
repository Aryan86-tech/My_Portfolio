import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const measurements = await prisma.bodyMeasurement.findMany({
      where: { userId: sessionUser.userId },
      orderBy: { date: "desc" },
    });

    const latest = measurements[0] || null;

    return NextResponse.json({
      measurements,
      latestSummary: latest
        ? {
            waist: latest.waist,
            chest: latest.chest,
            arms: latest.arms,
            thighs: latest.thighs,
            hip: latest.hip,
            neck: latest.neck,
            bodyFat: latest.bodyFat,
            unit: latest.unit || "in",
            date: latest.date,
          }
        : null,
    });
  } catch (error) {
    console.error("GET measurements error:", error);
    return NextResponse.json({ error: "Could not fetch measurements." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { date, waist, chest, arms, thighs, hip, neck, bodyFat, unit, notes } = body;

    const logDate = date || new Date().toISOString().split("T")[0];

    const log = await prisma.bodyMeasurement.create({
      data: {
        userId: sessionUser.userId,
        date: logDate,
        waist: waist ? Number(waist) : null,
        chest: chest ? Number(chest) : null,
        arms: arms ? Number(arms) : null,
        thighs: thighs ? Number(thighs) : null,
        hip: hip ? Number(hip) : null,
        neck: neck ? Number(neck) : null,
        bodyFat: bodyFat ? Number(bodyFat) : null,
        unit: unit || "in",
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error("POST measurement error:", error);
    return NextResponse.json({ error: "Could not save measurement entry." }, { status: 500 });
  }
}
