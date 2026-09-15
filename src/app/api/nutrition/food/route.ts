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
    const dateParam = searchParams.get("date");
    const todayStr = dateParam || new Date().toISOString().split("T")[0];

    const foodLogs = await prisma.foodLog.findMany({
      where: { userId: sessionUser.userId, date: todayStr },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ foodLogs });
  } catch (error) {
    console.error("GET food log error:", error);
    return NextResponse.json({ error: "Could not fetch food log." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { date, mealType, foodName, quantity, calories, protein, carbs, fat, notes } = body;

    if (!foodName || !foodName.trim()) {
      return NextResponse.json({ error: "Food name is required." }, { status: 400 });
    }

    const logDate = date || new Date().toISOString().split("T")[0];

    const foodLog = await prisma.foodLog.create({
      data: {
        userId: sessionUser.userId,
        date: logDate,
        mealType: mealType || "Snack",
        foodName: foodName.trim(),
        quantity: quantity || null,
        calories: calories ? Number(calories) : null,
        protein: protein ? Number(protein) : null,
        carbs: carbs ? Number(carbs) : null,
        fat: fat ? Number(fat) : null,
        notes: notes || null,
      },
    });

    // If protein is provided, update NutritionLog total protein
    if (protein && Number(protein) > 0) {
      const existingNutrition = await prisma.nutritionLog.findUnique({
        where: { userId_date: { userId: sessionUser.userId, date: logDate } },
      });
      const newProteinTotal = (existingNutrition?.protein || 0) + Number(protein);

      await prisma.nutritionLog.upsert({
        where: { userId_date: { userId: sessionUser.userId, date: logDate } },
        create: {
          userId: sessionUser.userId,
          date: logDate,
          protein: Number(protein),
        },
        update: {
          protein: newProteinTotal,
        },
      });
    }

    return NextResponse.json({ success: true, foodLog });
  } catch (error) {
    console.error("POST food log error:", error);
    return NextResponse.json({ error: "Could not save food log entry." }, { status: 500 });
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
      return NextResponse.json({ error: "Food log ID is required." }, { status: 400 });
    }

    await prisma.foodLog.deleteMany({
      where: { id, userId: sessionUser.userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE food log error:", error);
    return NextResponse.json({ error: "Could not delete food log entry." }, { status: 500 });
  }
}
