export const CHALLENGE_TYPES = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
} as const;

export type ChallengeTypeName =
  typeof CHALLENGE_TYPES[keyof typeof CHALLENGE_TYPES];
