/**
 * Utility functions for pricing and order message formatting
 */

export function parsePriceToNumber(priceStr?: string): number {
  if (!priceStr) return 0;
  // Match numbers like "2 500" or "2500" before "FCFA" or "F" or end of line
  const cleaned = priceStr.replace(/\s+/g, '').replace(/,/g, '.');
  const match = cleaned.match(/(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return 0;
}

export function formatFCFA(amount: number): string {
  return amount.toLocaleString('fr-FR') + ' FCFA';
}
