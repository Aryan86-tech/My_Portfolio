import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateLevelFromXp, getRankFromLevel } from "@/lib/services/rpgEngine";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.userId },
      include: {
        profile: true,
        winterArcs: {
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 404 });
    }

    let profileData = user.profile;
    if (profileData) {
      const levelStats = calculateLevelFromXp(profileData.totalXp);
      const rankStats = getRankFromLevel(levelStats.level);

      // Keep level and rank updated in profile if changed
      if (profileData.level !== levelStats.level || profileData.rank !== rankStats.name) {
        profileData = await prisma.profile.update({
          where: { userId: user.id },
          data: {
            level: levelStats.level,
            rank: rankStats.name,
          },
        });
      }
    }

    const activeWinterArc = user.winterArcs[0] || null;

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      },
      profile: profileData,
      activeWinterArc,
    });
  } catch (error) {
    console.error("Auth /me error:", error);
    return NextResponse.json(
      { error: "Could not fetch user details." },
      { status: 500 }
    );
  }
}
