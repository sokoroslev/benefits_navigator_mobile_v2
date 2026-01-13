export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function containsCI(hay: string, needle: string) {
  return hay.toLocaleLowerCase().includes(needle.toLocaleLowerCase());
}

export function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

export function safeNumber(x: string, fallback: number) {
  const n = Number(String(x).replace(/\s/g, ""));
  return Number.isFinite(n) ? n : fallback;
}

export function isISODate(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}
