export function calcXpPreview({
  baseXp,
  moduleMultiplier,
  periodMultiplier = 1,
  xpMultiplier,
}: {
  baseXp: number;
  moduleMultiplier: number;
  periodMultiplier?: number;
  xpMultiplier: number;
}) {
  return Math.round(
    baseXp * moduleMultiplier * periodMultiplier * xpMultiplier
  );
}
