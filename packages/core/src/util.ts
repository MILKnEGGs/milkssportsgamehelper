export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/**
 * Reads money the way people type it in a notes app: "12.5m", "750k", "$1,200,000", "1.2 bn".
 * Returns undefined for blank or unreadable input.
 */
export function parseMoney(text: string | number | undefined | null): number | undefined {
  if (typeof text === 'number') return Number.isFinite(text) ? text : undefined;
  if (!text) return undefined;
  const m = String(text)
    .toLowerCase()
    .replace(/[,\s$€£]/g, '')
    .match(/^(-?\d*\.?\d+)(k|m|mil|b|bn)?$/);
  if (!m) return undefined;
  const n = parseFloat(m[1]);
  const mult = { k: 1e3, m: 1e6, mil: 1e6, b: 1e9, bn: 1e9 }[m[2] as 'k'] ?? 1;
  return Math.round(n * mult);
}

/** Short money: 12.5M, 750K, 900. */
export function formatMoney(n: number | undefined, symbol = '$'): string {
  if (n === undefined || !Number.isFinite(n)) return '';
  const sign = n < 0 ? '-' : '';
  const a = Math.abs(n);
  const trim = (x: number) => (Math.round(x * 100) / 100).toString();
  if (a >= 1e9) return `${sign}${symbol}${trim(a / 1e9)}B`;
  if (a >= 1e6) return `${sign}${symbol}${trim(a / 1e6)}M`;
  if (a >= 1e3) return `${sign}${symbol}${trim(a / 1e3)}K`;
  return `${sign}${symbol}${a}`;
}

/** Whole number from an input, or undefined when blank / not a number. */
export function parseIntOrUndefined(v: unknown): number | undefined {
  if (v === '' || v === null || v === undefined) return undefined;
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? n : undefined;
}

/** Moves the item at `from` to `to` in place. */
export function move<T>(list: T[], from: number, to: number): void {
  if (to < 0 || to >= list.length || from === to) return;
  const [x] = list.splice(from, 1);
  list.splice(to, 0, x);
}

/** Svelte attachment: focuses the element when it mounts (the autofocus attribute is skipped if something else has focus). */
export const focusIf = (on: boolean) => (node: HTMLElement) => {
  if (on) node.focus();
};
