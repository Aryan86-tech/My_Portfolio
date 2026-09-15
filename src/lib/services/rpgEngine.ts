/**
 * WINTER ARC — RPG Progression Engine
 * Centralized business logic for Levels, Ranks, XP Calculations, Streaks, Achievements, and Daily Scores.
 */

export interface RankConfig {
  name: string;
  minLevel: number;
  maxLevel: number;
  color: string;
  badge: string;
}

export const RANKS: RankConfig[] = [
  { name: "RECRUIT", minLevel: 1, maxLevel: 4, color: "#94a3b8", badge: "🛡️" },
  { name: "INITIATE", minLevel: 5, maxLevel: 9, color: "#38bdf8", badge: "⚔️" },
  { name: "DISCIPLINED", minLevel: 10, maxLevel: 19, color: "#22d3ee", badge: "⚡" },
  { name: "WARRIOR", minLevel: 20, maxLevel: 29, color: "#a855f7", badge: "🐺" },
  { name: "ELITE", minLevel: 30, maxLevel: 49, color: "#f59e0b", badge: "👑" },
  { name: "WINTER ARC LEGEND", minLevel: 50, maxLevel: 999, color: "#ef4444", badge: "❄️" },
];

/**
 * Difficulty to default XP mapping
 */
export const DIFFICULTY_XP: Record<string, number> = {
  EASY: 10,
  MEDIUM: 25,
  HARD: 50,
  ELITE: 100,
};

/**
 * Calculates XP required to reach a specific level.
 */
export function getXpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  let totalXp = 0;
  for (let l = 1; l < level; l++) {
    totalXp += Math.round(100 * Math.pow(l, 1.25));
  }
  return totalXp;
}

/**
 * Calculates current level from total XP.
 */
export function calculateLevelFromXp(totalXp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
} {
  let level = 1;
  while (totalXp >= getXpRequiredForLevel(level + 1)) {
    level++;
  }

  const currentLevelStart = getXpRequiredForLevel(level);
  const nextLevelStart = getXpRequiredForLevel(level + 1);
  const xpInCurrentLevel = totalXp - currentLevelStart;
  const xpNeededForNext = nextLevelStart - currentLevelStart;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((xpInCurrentLevel / xpNeededForNext) * 100))
  );

  return {
    level,
    currentLevelXp: xpInCurrentLevel,
    nextLevelXp: xpNeededForNext,
    progressPercent,
  };
}

/**
 * Returns Rank badge and metadata based on level.
 */
export function getRankFromLevel(level: number): RankConfig {
  const rank = RANKS.find((r) => level >= r.minLevel && level <= r.maxLevel);
  return rank || RANKS[0];
}

/**
 * Checks if adding new XP causes a level up.
 */
export function checkLevelUp(oldXp: number, newXp: number): {
  didLevelUp: boolean;
  oldLevel: number;
  newLevel: number;
  oldRank: string;
  newRank: string;
} {
  const oldLevelStats = calculateLevelFromXp(oldXp);
  const newLevelStats = calculateLevelFromXp(newXp);
  const oldRankStats = getRankFromLevel(oldLevelStats.level);
  const newRankStats = getRankFromLevel(newLevelStats.level);

  return {
    didLevelUp: newLevelStats.level > oldLevelStats.level,
    oldLevel: oldLevelStats.level,
    newLevel: newLevelStats.level,
    oldRank: oldRankStats.name,
    newRank: newRankStats.name,
  };
}

/**
 * Default XP rewards table.
 */
export const XP_CONFIG = {
  TASK_EASY: 10,
  TASK_MEDIUM: 25,
  TASK_HARD: 50,
  TASK_ELITE: 100,
  WORKOUT_COMPLETED: 100,
  ALL_EXERCISES_BONUS: 50,
  PERSONAL_RECORD: 25,
  PERFECT_DAY_BONUS: 50,
  WEEKLY_COMPLETION_BONUS: 200,
  HABIT_COMPLETED: 25,
  WATER_GOAL_MET: 30,
};

/**
 * Calculates daily score from component percentages.
 * Weights: Fitness 30%, Nutrition 25%, Discipline 25%, Recovery 20%
 */
export function calculateDailyScore(scores: {
  fitness: number;   // 0 - 100
  nutrition: number; // 0 - 100
  discipline: number;// 0 - 100
  recovery: number;  // 0 - 100
}): {
  overallScore: number;
  breakdown: {
    fitness: number;
    nutrition: number;
    discipline: number;
    recovery: number;
  };
} {
  const fitnessScore = Math.min(100, Math.max(0, scores.fitness));
  const nutritionScore = Math.min(100, Math.max(0, scores.nutrition));
  const disciplineScore = Math.min(100, Math.max(0, scores.discipline));
  const recoveryScore = Math.min(100, Math.max(0, scores.recovery));

  const overallScore = Math.round(
    fitnessScore * 0.3 +
    nutritionScore * 0.25 +
    disciplineScore * 0.25 +
    recoveryScore * 0.2
  );

  return {
    overallScore,
    breakdown: {
      fitness: fitnessScore,
      nutrition: nutritionScore,
      discipline: disciplineScore,
      recovery: recoveryScore,
    },
  };
}

/**
 * Anti-shaming encouragement messages when streaks reset or missing days.
 */
export function getEncouragementMessage(): string {
  const messages = [
    "Reset today. Your journey continues.",
    "One bad meal or missed task doesn't erase your progress.",
    "Yesterday is done. Focus on your next decision.",
    "Get back on track. Champions rebuild every day.",
    "Your progress is stored. Pick up your weapons.",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}
