/** Columnas del grid de navegación en footer submarca — dos filas equilibradas (6 → 3+3). */
export function footerNavGridColumns(itemCount: number): number {
  if (itemCount <= 1) return Math.max(itemCount, 1);
  if (itemCount % 2 === 0) return itemCount / 2;
  return Math.ceil(itemCount / 2);
}
