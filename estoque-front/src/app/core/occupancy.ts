export type Tier = 'green' | 'amber' | 'red';

export function occupancyTier(pct: number): Tier {
  if (pct >= 95) return 'red';
  if (pct >= 80) return 'amber';
  return 'green';
}

export function occupancyText(pct: number): string {
  const tier = occupancyTier(pct);
  const label = tier === 'red' ? 'Crítico' : tier === 'amber' ? 'Ocupação elevada' : 'Disponível';
  return `${pct}% — ${label}`;
}
