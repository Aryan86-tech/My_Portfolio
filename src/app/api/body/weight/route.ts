import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: sessionUser.userId },
    });

    const weightLogs = await prisma.bodyMeasurement.findMany({
      where: {
        userId: sessionUser.userId,
        weight: { not: null },
      },
      orderBy: { date: "desc" },
    });

    const currentWeight = profile?.currentWeight || (weightLogs[0]?.weight ?? null);
    const targetWeight = profile?.targetWeight || null;
    const startingWeight = profile?.startingWeight || (weightLogs[weightLogs.length - 1]?.weight ?? currentWeight ?? null);
    const unit = profile?.unitPreference || "kg";

    const totalChange = currentWeight && startingWeight ? Math.round((currentWeight - startingWeight) * 10) / 10 : 0;
    const remaining = currentWeight && targetWeight ? Math.max(0, Math.round(Math.abs(currentWeight - targetWeight) * 10) / 10) : 0;

    // Progress percentage
    let progressPercent = 0;
    if (startingWeight && targetWeight && currentWeight) {
      const totalDist = Math.abs(startingWeight - targetWeight);
      const covered = Math.abs(startingWeight - currentWeight);
      progressPercent = totalDist > 0 ? Math.min(100, Math.round((covered / totalDist) * 100)) : 100;
    }

    return NextResponse.json({
      currentWeight,
      targetWeight,
      startingWeight,
      unit,
      totalChange,
      remaining,
      progressPercent,
      history: weightLogs,
    });
  } catch (error) {
    console.error("GET weight error:", error);
    return NextResponse.json({ error: "Could not fetch weight data." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { weight, date, notes, unit } = body;

    if (!weight || Number(weight) <= 0) {
      return NextResponse.json({ error: "Valid weight is required." }, { status: 400 });
    }

    const weightVal = Number(weight);
    const logDate = date || new Date().toISOString().split("T")[0];

    // Create or update body measurement entry for logDate
    const log = await prisma.bodyMeasurement.create({
      data: {
        userId: sessionUser.userId,
        date: logDate,
        weight: weightVal,
        unit: unit || "kg",
        notes: notes || null,
      },
    });

    // Check existing profile startingWeight
    const profile = await prisma.profile.findUnique({
      where: { userId: sessionUser.userId },
    });

    await prisma.profile.update({
      where: { userId: sessionUser.userId },
      data: {
        currentWeight: weightVal,
        startingWeight: profile?.startingWeight ?? weightVal,
        unitPreference: unit || profile?.unitPreference || "kg",
      },
    });

    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error("POST weight error:", error);
    return NextResponse.json({ error: "Could not save weight entry." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { targetWeight, startingWeight, unitPreference } = body;

    const updatedProfile = await prisma.profile.update({
      where: { userId: sessionUser.userId },
      data: {
        ...(targetWeight !== undefined && { targetWeight: Number(targetWeight) }),
        ...(startingWeight !== undefined && { startingWeight: Number(startingWeight) }),
        ...(unitPreference !== undefined && { unitPreference }),
      },
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error("PUT weight settings error:", error);
    return NextResponse.json({ error: "Could not update weight settings." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Record ID is required." }, { status: 400 });
    }

    await prisma.bodyMeasurement.deleteMany({
      where: { id, userId: sessionUser.userId },
    });

    // Update currentWeight to latest available entry
    const latest = await prisma.bodyMeasurement.findFirst({
      where: { userId: sessionUser.userId, weight: { not: null } },
      orderBy: { date: "desc" },
    });

    if (latest && latest.weight) {
      await prisma.profile.update({
        where: { userId: sessionUser.userId },
        data: { currentWeight: latest.weight },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE weight error:", error);
    return NextResponse.json({ error: "Could not delete weight record." }, { status: 500 });
  }
}
