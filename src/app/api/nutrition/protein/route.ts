import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkLevelUp } from "@/lib/services/rpgEngine";

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amountGrams, date, notes } = body;

    if (!amountGrams || Number(amountGrams) <= 0) {
      return NextResponse.json({ error: "Valid protein amount is required." }, { status: 400 });
    }

    const grams = Number(amountGrams);
    const todayStr = date || new Date().toISOString().split("T")[0];

    const profile = await prisma.profile.findUnique({
      where: { userId: sessionUser.userId },
    });
    const oldXp = profile?.totalXp || 0;
    const proteinTarget = profile?.proteinGoalGrams || 150;

    const existingLog = await prisma.nutritionLog.findUnique({
      where: { userId_date: { userId: sessionUser.userId, date: todayStr } },
    });

    const currentProtein = (existingLog?.protein || 0) + grams;

    const updatedLog = await prisma.nutritionLog.upsert({
      where: { userId_date: { userId: sessionUser.userId, date: todayStr } },
      create: {
        userId: sessionUser.userId,
        date: todayStr,
        protein: grams,
        notes: notes || null,
      },
      update: {
        protein: currentProtein,
        ...(notes && { notes }),
      },
    });

    let xpEarned = 0;
    if (currentProtein >= proteinTarget) {
      const proteinRef = `NUTRITION_PROTEIN_${todayStr}`;
      const existingTx = await prisma.xPTransaction.findFirst({
        where: { userId: sessionUser.userId, referenceId: proteinRef },
      });
      if (!existingTx) {
        await prisma.xPTransaction.create({
          data: {
            userId: sessionUser.userId,
            amount: 30,
            source: "TASK",
            description: `Daily Protein Goal Reached (${Math.round(currentProtein)}g / ${proteinTarget}g)`,
            referenceId: proteinRef,
          },
        });
        xpEarned = 30;

        await prisma.profile.update({
          where: { userId: sessionUser.userId },
          data: { totalXp: oldXp + 30 },
        });
      }
    }

    const levelUpData = checkLevelUp(oldXp, oldXp + xpEarned);

    return NextResponse.json({
      success: true,
      currentProtein,
      proteinTarget,
      xpEarned,
      levelUpData,
      log: updatedLog,
    });
  } catch (error) {
    console.error("POST protein log error:", error);
    return NextResponse.json({ error: "Could not log protein intake." }, { status: 500 });
  }
}
